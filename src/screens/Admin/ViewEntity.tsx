import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '../../components/ui/card';
import { Entity } from '../../types/entity';
import { fetchEntityById } from '../../services/entityService';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';

const ViewEntity = () => {
    const { id } = useParams<{ id: string }>();
    const [entity, setEntity] = useState<Entity | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (id) {
            const loadEntity = async () => {
                setLoading(true);
                try {
                    const data = await fetchEntityById(Number(id));
                    setEntity(data);
                    setError(null);
                } catch (err) {
                    console.error('Failed to fetch entity:', err);
                    setError('Failed to load entity details');
                    setEntity(null);
                } finally {
                    setLoading(false);
                }
            };

            loadEntity();
        }
    }, [id]);

    const handleEdit = () => {
        if (id) {
            navigate(`/react-vite-supreme/admin/edit-entity/${id}`);
        }
    };

    const handleBack = () => {
        navigate('/react-vite-supreme/admin/entities');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !entity) {
        return (
            <div className="p-6 space-y-6">
                <Button variant="outline" onClick={handleBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Entities
                </Button>
                <Card className="mt-4">
                    <CardContent className="pt-6">
                        <div className="text-center text-red-500">{error || 'Entity not found'}</div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="outline" onClick={handleBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Entities
                </Button>
                <Button onClick={handleEdit}>
                    <Edit className="mr-2 h-4 w-4" /> Edit Entity
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{entity.name}</CardTitle>
                    <CardDescription>Entity Type: {entity.entity_type}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                            <p>{entity.email}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Mobile Number</h3>
                            <p>{entity.mobile_number}</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Custom Fields</h3>
                        <div className="space-y-4">
                            {entity.custom_fields.map((field) => (
                                <Card key={field.id}>
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-center">
                                            <CardTitle className="text-base">{field.name}</CardTitle>
                                            <span className={`px-2 py-1 text-xs rounded-full ${field.is_required ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                {field.is_required ? 'Required' : 'Optional'}
                                            </span>
                                        </div>
                                        <CardDescription>Type: {field.field_type}</CardDescription>
                                    </CardHeader>
                                    {field.field_values.length > 0 && (
                                        <CardContent>
                                            <div className="text-sm text-muted-foreground">Values:</div>
                                            <ul className="list-disc pl-5">
                                                {field.field_values.map((value) => (
                                                    <li key={value.id}>{value.value}</li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    )}
                                </Card>
                            ))}
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground">
                    <div className="flex justify-between w-full">
                        <span>Created: {new Date(entity.created_date).toLocaleString()}</span>
                        <span>Last Updated: {new Date(entity.updated_date).toLocaleString()}</span>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};

export default ViewEntity;
