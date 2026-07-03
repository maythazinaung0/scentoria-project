import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function ScentProfilesPage() {
    const [scents, setScents] = useState([]);

    useEffect(() => {
        fetch('http://localhost/api/scents')
            .then(res => res.json())
            .then(data => setScents(data))
            .catch(err => console.error("Error:", err));
    }, []);

    return (
        <div className="py-12 px-6 max-w-7xl mx-auto">
            <h2 className="text-3xl font-serif mb-10 text-center">Explore Scent Profiles</h2>
            <div className="grid md:grid-cols-3 gap-6">
                {scents.map(scent => (
                    <div key={scent.id} className="border p-6 rounded-xl hover:shadow-lg transition-shadow">
                        <h3 className="text-xl font-semibold mb-3">{scent.name}</h3>
                        <p className="text-gray-600 mb-4 text-sm">{scent.description}</p>
                        <Link to={`/scents/${scent.id}`} className="text-sm font-bold underline">
                            View Collection
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}