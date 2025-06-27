import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Entity } from '../../types/entity';
import { fetchEntities, deleteEntity } from '../../services/entityService';
import { PlusCircle, Search, Edit, Trash2, Eye } from 'lucide-react';

const Entities = () => {
    const [entities, setEntities] = useState<Entity[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        loadEntities();
    }, []);

    const loadEntities = async () => {
        setLoading(true);
        try {
            const data = await fetchEntities();
            setEntities(data);
        } catch (error) {
            console.error('Failed to fetch entities:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewEntity = (id: number) => {
        navigate(`/react-vite-supreme/admin/entity/${id}`);
    };

    const handleEditEntity = (id: number) => {
        navigate(`/react-vite-supreme/admin/edit-entity/${id}`);
    };

    const handleDeleteEntity = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this entity?')) {
            try {
                await deleteEntity(id);
                setEntities(entities.filter(entity => entity.id !== id));
            } catch (error) {
                console.error('Failed to delete entity:', error);
            }
        }
    };

    const handleAddNewEntity = () => {
        navigate('/react-vite-supreme/admin/add-entity');
    };

    const filteredEntities = entities.filter(entity =>
        entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entity.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entity.entity_type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold">Entities</h1>
                <Button onClick={handleAddNewEntity}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Entity
                </Button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search entities..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : (
                <Table>
                    <TableCaption>A list of all entities.</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredEntities.length > 0 ? (
                            filteredEntities.map((entity) => (
                                <TableRow key={entity.id}>
                                    <TableCell className="font-medium">{entity.name}</TableCell>
                                    <TableCell>{entity.entity_type}</TableCell>
                                    <TableCell>{entity.email}</TableCell>
                                    <TableCell>{entity.mobile_number}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleViewEntity(entity.id)}>
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleEditEntity(entity.id)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteEntity(entity.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">
                                    No entities found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            )}
        </div>
    );
};

export default Entities;
