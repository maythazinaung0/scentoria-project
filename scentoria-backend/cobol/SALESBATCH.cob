>>SOURCE FORMAT FREE
       IDENTIFICATION DIVISION.
       PROGRAM-ID. SALESBATCH.
       AUTHOR. SCENTORIA.

      *> -----------------------------------------------------------
      *> Sales batch job. Runs nightly on a schedule, or on demand
      *> when an admin clicks "Run Now" on the Sales Report page.
      *>
      *> Reads one fixed-width record per completed order line item
      *> (written by Laravel's `sales:export` command) and produces
      *> three summary files:
      *>   1. daily_revenue.csv   - total revenue per YYYYMMDD
      *>   2. monthly_revenue.csv - total revenue per YYYYMM
      *>                            (month is derived from the day
      *>                            key, not sent separately)
      *>   3. product_sales.csv   - qty/revenue per product,
      *>                            sorted by quantity descending
      *>
      *> Input/output directories are passed in via environment
      *> variables (SALES_INPUT_DIR / SALES_OUTPUT_DIR) so the
      *> program never hardcodes a path outside Laravel's storage
      *> tree.
      *> -----------------------------------------------------------

       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT SALES-INPUT
               ASSIGN TO WS-INPUT-PATH
               ORGANIZATION IS LINE SEQUENTIAL.

           SELECT DAILY-OUTPUT
               ASSIGN TO WS-DAILY-OUT-PATH
               ORGANIZATION IS LINE SEQUENTIAL.

           SELECT MONTHLY-OUTPUT
               ASSIGN TO WS-MONTHLY-OUT-PATH
               ORGANIZATION IS LINE SEQUENTIAL.

           SELECT PRODUCT-OUTPUT
               ASSIGN TO WS-PRODUCT-OUT-PATH
               ORGANIZATION IS LINE SEQUENTIAL.

       DATA DIVISION.
       FILE SECTION.

      *> Record layout must match ExportSalesDataCommand exactly:
      *> 8 + 30 + 5 + 10 = 53 characters per line. The month bucket
      *> is derived from the first 6 characters of IN-DATE rather
      *> than being sent as a separate field.
       FD  SALES-INPUT.
       01  INPUT-RECORD.
           05  IN-DATE             PIC X(8).
           05  IN-PRODUCT          PIC X(30).
           05  IN-QUANTITY         PIC 9(5).
           05  IN-TOTAL            PIC 9(10).

      *> 8 + 12 = 20 characters per line.
       FD  DAILY-OUTPUT.
       01  DAY-OUT-RECORD.
           05  OUT-DATE            PIC X(8).
           05  OUT-DAY-REVENUE     PIC 9(12).

      *> 6 + 12 = 18 characters per line.
       FD  MONTHLY-OUTPUT.
       01  MONTH-OUT-RECORD.
           05  OUT-YEARMONTH       PIC X(6).
           05  OUT-MONTH-REVENUE   PIC 9(12).

      *> 30 + 7 + 12 = 49 characters per line.
       FD  PRODUCT-OUTPUT.
       01  PRODUCT-OUT-RECORD.
           05  OUT-PRODUCT         PIC X(30).
           05  OUT-PROD-QTY        PIC 9(7).
           05  OUT-PROD-REVENUE    PIC 9(12).

       WORKING-STORAGE SECTION.
       01  WS-INPUT-DIR             PIC X(200).
       01  WS-OUTPUT-DIR            PIC X(200).
       01  WS-INPUT-PATH            PIC X(250).
       01  WS-DAILY-OUT-PATH        PIC X(250).
       01  WS-MONTHLY-OUT-PATH      PIC X(250).
       01  WS-PRODUCT-OUT-PATH      PIC X(250).

       01  WS-EOF                   PIC X       VALUE 'N'.
           88  END-OF-FILE                      VALUE 'Y'.

      *> 400 days ~ 13 months of daily history before this needs to
      *> grow. Bump OCCURS here (and re-test) if that's not enough.
       01  WS-DAY-COUNT             PIC 9(3)    VALUE 0.
       01  WS-DAY-TABLE.
           05  DAY-ENTRY   OCCURS 400 TIMES
                           INDEXED BY DAY-IDX.
               10  DAY-KEY          PIC X(8).
               10  DAY-REVENUE      PIC 9(12).

      *> 60 months = 5 years of history before this needs to grow.
       01  WS-MONTH-COUNT           PIC 9(3)    VALUE 0.
       01  WS-MONTH-TABLE.
           05  MONTH-ENTRY OCCURS 60 TIMES
                           INDEXED BY MONTH-IDX.
               10  MONTH-KEY        PIC X(6).
               10  MONTH-REVENUE    PIC 9(12).

      *> 500 distinct products is plenty for a course-scale catalog.
       01  WS-PROD-COUNT            PIC 9(4)    VALUE 0.
       01  WS-PROD-TABLE.
           05  PROD-ENTRY  OCCURS 500 TIMES
                           INDEXED BY PROD-IDX.
               10  PROD-NAME        PIC X(30).
               10  PROD-QTY         PIC 9(7).
               10  PROD-REVENUE     PIC 9(12).

       01  WS-FOUND                 PIC X       VALUE 'N'.
           88  ENTRY-FOUND                      VALUE 'Y'.

       01  WS-SWAPPED               PIC X       VALUE 'N'.
           88  DID-SWAP                         VALUE 'Y'.

       01  WS-TEMP-DAY-KEY          PIC X(8).
       01  WS-TEMP-DAY-REV          PIC 9(12).
       01  WS-TEMP-MONTH-KEY        PIC X(6).
       01  WS-TEMP-MONTH-REV        PIC 9(12).
       01  WS-TEMP-PROD-NAME        PIC X(30).
       01  WS-TEMP-PROD-QTY         PIC 9(7).
       01  WS-TEMP-PROD-REV         PIC 9(12).
       01  WS-H                     PIC 9(4).
       01  WS-I                     PIC 9(4).
       01  WS-J                     PIC 9(4).

       PROCEDURE DIVISION.
       MAIN-LOGIC.
           PERFORM RESOLVE-PATHS
           OPEN INPUT SALES-INPUT

           PERFORM UNTIL END-OF-FILE
               READ SALES-INPUT
                   AT END
                       MOVE 'Y' TO WS-EOF
                   NOT AT END
                       PERFORM PROCESS-RECORD
               END-READ
           END-PERFORM

           CLOSE SALES-INPUT

           PERFORM SORT-DAYS-ASCENDING
           PERFORM SORT-MONTHS-ASCENDING
           PERFORM SORT-PRODUCTS-DESCENDING

           PERFORM WRITE-DAILY-OUTPUT
           PERFORM WRITE-MONTHLY-OUTPUT
           PERFORM WRITE-PRODUCT-OUTPUT

           STOP RUN.

       RESOLVE-PATHS.
           ACCEPT WS-INPUT-DIR  FROM ENVIRONMENT "SALES_INPUT_DIR"
           ACCEPT WS-OUTPUT-DIR FROM ENVIRONMENT "SALES_OUTPUT_DIR"

           STRING FUNCTION TRIM(WS-INPUT-DIR) DELIMITED BY SIZE
                  "/sales_input.dat"          DELIMITED BY SIZE
                  INTO WS-INPUT-PATH
           END-STRING

           STRING FUNCTION TRIM(WS-OUTPUT-DIR) DELIMITED BY SIZE
                  "/daily_revenue.dat"        DELIMITED BY SIZE
                  INTO WS-DAILY-OUT-PATH
           END-STRING

           STRING FUNCTION TRIM(WS-OUTPUT-DIR) DELIMITED BY SIZE
                  "/monthly_revenue.dat"      DELIMITED BY SIZE
                  INTO WS-MONTHLY-OUT-PATH
           END-STRING

           STRING FUNCTION TRIM(WS-OUTPUT-DIR) DELIMITED BY SIZE
                  "/product_sales.dat"        DELIMITED BY SIZE
                  INTO WS-PRODUCT-OUT-PATH
           END-STRING.

       PROCESS-RECORD.
           PERFORM ACCUMULATE-DAY
           PERFORM ACCUMULATE-MONTH
           PERFORM ACCUMULATE-PRODUCT.

       ACCUMULATE-DAY.
           MOVE 'N' TO WS-FOUND
           PERFORM VARYING DAY-IDX FROM 1 BY 1
                   UNTIL DAY-IDX > WS-DAY-COUNT
               IF DAY-KEY(DAY-IDX) = IN-DATE
                   ADD IN-TOTAL TO DAY-REVENUE(DAY-IDX)
                   MOVE 'Y' TO WS-FOUND
                   SET DAY-IDX TO WS-DAY-COUNT
               END-IF
           END-PERFORM

           IF NOT ENTRY-FOUND
               ADD 1 TO WS-DAY-COUNT
               SET DAY-IDX TO WS-DAY-COUNT
               MOVE IN-DATE  TO DAY-KEY(DAY-IDX)
               MOVE IN-TOTAL TO DAY-REVENUE(DAY-IDX)
           END-IF.

      *> Month bucket is just the first 6 characters of the date
      *> (YYYYMMDD -> YYYYMM) via COBOL reference modification —
      *> no separate month field needs to travel through the input
      *> file.
       ACCUMULATE-MONTH.
           MOVE 'N' TO WS-FOUND
           PERFORM VARYING MONTH-IDX FROM 1 BY 1
                   UNTIL MONTH-IDX > WS-MONTH-COUNT
               IF MONTH-KEY(MONTH-IDX) = IN-DATE(1:6)
                   ADD IN-TOTAL TO MONTH-REVENUE(MONTH-IDX)
                   MOVE 'Y' TO WS-FOUND
                   SET MONTH-IDX TO WS-MONTH-COUNT
               END-IF
           END-PERFORM

           IF NOT ENTRY-FOUND
               ADD 1 TO WS-MONTH-COUNT
               SET MONTH-IDX TO WS-MONTH-COUNT
               MOVE IN-DATE(1:6) TO MONTH-KEY(MONTH-IDX)
               MOVE IN-TOTAL     TO MONTH-REVENUE(MONTH-IDX)
           END-IF.

       ACCUMULATE-PRODUCT.
           MOVE 'N' TO WS-FOUND
           PERFORM VARYING PROD-IDX FROM 1 BY 1
                   UNTIL PROD-IDX > WS-PROD-COUNT
               IF PROD-NAME(PROD-IDX) = IN-PRODUCT
                   ADD IN-QUANTITY TO PROD-QTY(PROD-IDX)
                   ADD IN-TOTAL    TO PROD-REVENUE(PROD-IDX)
                   MOVE 'Y' TO WS-FOUND
                   SET PROD-IDX TO WS-PROD-COUNT
               END-IF
           END-PERFORM

           IF NOT ENTRY-FOUND
               ADD 1 TO WS-PROD-COUNT
               SET PROD-IDX TO WS-PROD-COUNT
               MOVE IN-PRODUCT  TO PROD-NAME(PROD-IDX)
               MOVE IN-QUANTITY TO PROD-QTY(PROD-IDX)
               MOVE IN-TOTAL    TO PROD-REVENUE(PROD-IDX)
           END-IF.

      *> Table sizes here are course-project scale, so a plain bubble
      *> sort keeps the logic easy to read (and easy to grade) instead
      *> of reaching for the SORT verb + external work files.
       SORT-DAYS-ASCENDING.
           MOVE 'Y' TO WS-SWAPPED
           PERFORM UNTIL WS-SWAPPED = 'N'
               MOVE 'N' TO WS-SWAPPED
               PERFORM VARYING WS-H FROM 1 BY 1
                       UNTIL WS-H >= WS-DAY-COUNT
                   IF DAY-KEY(WS-H) > DAY-KEY(WS-H + 1)
                       MOVE DAY-KEY(WS-H)         TO WS-TEMP-DAY-KEY
                       MOVE DAY-REVENUE(WS-H)     TO WS-TEMP-DAY-REV
                       MOVE DAY-KEY(WS-H + 1)     TO DAY-KEY(WS-H)
                       MOVE DAY-REVENUE(WS-H + 1) TO DAY-REVENUE(WS-H)
                       MOVE WS-TEMP-DAY-KEY       TO DAY-KEY(WS-H + 1)
                       MOVE WS-TEMP-DAY-REV       TO DAY-REVENUE(WS-H + 1)
                       MOVE 'Y' TO WS-SWAPPED
                   END-IF
               END-PERFORM
           END-PERFORM.

       SORT-MONTHS-ASCENDING.
           MOVE 'Y' TO WS-SWAPPED
           PERFORM UNTIL WS-SWAPPED = 'N'
               MOVE 'N' TO WS-SWAPPED
               PERFORM VARYING WS-I FROM 1 BY 1
                       UNTIL WS-I >= WS-MONTH-COUNT
                   IF MONTH-KEY(WS-I) > MONTH-KEY(WS-I + 1)
                       MOVE MONTH-KEY(WS-I)         TO WS-TEMP-MONTH-KEY
                       MOVE MONTH-REVENUE(WS-I)     TO WS-TEMP-MONTH-REV
                       MOVE MONTH-KEY(WS-I + 1)     TO MONTH-KEY(WS-I)
                       MOVE MONTH-REVENUE(WS-I + 1) TO MONTH-REVENUE(WS-I)
                       MOVE WS-TEMP-MONTH-KEY       TO MONTH-KEY(WS-I + 1)
                       MOVE WS-TEMP-MONTH-REV       TO MONTH-REVENUE(WS-I + 1)
                       MOVE 'Y' TO WS-SWAPPED
                   END-IF
               END-PERFORM
           END-PERFORM.

       SORT-PRODUCTS-DESCENDING.
           MOVE 'Y' TO WS-SWAPPED
           PERFORM UNTIL WS-SWAPPED = 'N'
               MOVE 'N' TO WS-SWAPPED
               PERFORM VARYING WS-J FROM 1 BY 1
                       UNTIL WS-J >= WS-PROD-COUNT
                   IF PROD-QTY(WS-J) < PROD-QTY(WS-J + 1)
                       MOVE PROD-NAME(WS-J)        TO WS-TEMP-PROD-NAME
                       MOVE PROD-QTY(WS-J)         TO WS-TEMP-PROD-QTY
                       MOVE PROD-REVENUE(WS-J)     TO WS-TEMP-PROD-REV
                       MOVE PROD-NAME(WS-J + 1)    TO PROD-NAME(WS-J)
                       MOVE PROD-QTY(WS-J + 1)     TO PROD-QTY(WS-J)
                       MOVE PROD-REVENUE(WS-J + 1) TO PROD-REVENUE(WS-J)
                       MOVE WS-TEMP-PROD-NAME      TO PROD-NAME(WS-J + 1)
                       MOVE WS-TEMP-PROD-QTY       TO PROD-QTY(WS-J + 1)
                       MOVE WS-TEMP-PROD-REV       TO PROD-REVENUE(WS-J + 1)
                       MOVE 'Y' TO WS-SWAPPED
                   END-IF
               END-PERFORM
           END-PERFORM.

       WRITE-DAILY-OUTPUT.
           OPEN OUTPUT DAILY-OUTPUT
           PERFORM VARYING DAY-IDX FROM 1 BY 1
                   UNTIL DAY-IDX > WS-DAY-COUNT
               MOVE DAY-KEY(DAY-IDX)     TO OUT-DATE
               MOVE DAY-REVENUE(DAY-IDX) TO OUT-DAY-REVENUE
               WRITE DAY-OUT-RECORD
           END-PERFORM
           CLOSE DAILY-OUTPUT.

       WRITE-MONTHLY-OUTPUT.
           OPEN OUTPUT MONTHLY-OUTPUT
           PERFORM VARYING MONTH-IDX FROM 1 BY 1
                   UNTIL MONTH-IDX > WS-MONTH-COUNT
               MOVE MONTH-KEY(MONTH-IDX)     TO OUT-YEARMONTH
               MOVE MONTH-REVENUE(MONTH-IDX) TO OUT-MONTH-REVENUE
               WRITE MONTH-OUT-RECORD
           END-PERFORM
           CLOSE MONTHLY-OUTPUT.

       WRITE-PRODUCT-OUTPUT.
           OPEN OUTPUT PRODUCT-OUTPUT
           PERFORM VARYING PROD-IDX FROM 1 BY 1
                   UNTIL PROD-IDX > WS-PROD-COUNT
               MOVE PROD-NAME(PROD-IDX)     TO OUT-PRODUCT
               MOVE PROD-QTY(PROD-IDX)      TO OUT-PROD-QTY
               MOVE PROD-REVENUE(PROD-IDX)  TO OUT-PROD-REVENUE
               WRITE PRODUCT-OUT-RECORD
           END-PERFORM
           CLOSE PRODUCT-OUTPUT.