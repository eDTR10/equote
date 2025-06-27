import { Link } from 'react-router-dom';
import { Users, FileText, Loader2, BarChart3, PieChart, Calendar } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useState, useEffect } from 'react';
import axios from '../../plugin/axios';
import { useAppContext } from '../../context/AppContext';

// Define interfaces for API responses
interface ApiEntity {
    id: number | string;
    name: string;
    entity_type: string;
    email: string;
    mobile_number: string;
    quotations: ApiQuotation[];
    created_date: string;
    updated_date: string;
}

interface ApiQuotation {
    id: number | string;
    quotation_number: string;
    issue_date: string;
    valid_until: string;
    status: string;
    total_amount: number;
    is_paid: boolean;
    entity: number | string;
}

const Dashboard = () => {
    const { getNextQuotationNumber } = useAppContext();
    const [entities, setEntities] = useState<ApiEntity[]>([]);
    const [quotations, setQuotations] = useState<ApiQuotation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch data on component mount
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch entities
                const entitiesResponse = await axios.get('/quotation/entities/');
                const fetchedEntities = entitiesResponse.data;
                setEntities(fetchedEntities);

                // Fetch quotations
                const quotationsResponse = await axios.get('/quotation/');
                const fetchedQuotations = quotationsResponse.data;

                // Sort quotations by issue date (newest first) for recent quotations display
                const sortedQuotations = [...fetchedQuotations].sort((a, b) => {
                    return new Date(b.issue_date).getTime() - new Date(a.issue_date).getTime();
                });

                setQuotations(sortedQuotations);
                setError(null);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError('Failed to load dashboard data. Please refresh the page.');
                // Set empty arrays if API fails
                setEntities([]);
                setQuotations([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Calculate statistics
    const totalQuotations = quotations.length;
    const pendingQuotations = quotations.filter(q => q.status === 'pending').length;
    const paidQuotations = quotations.filter(q => q.is_paid || q.status === 'paid').length;
    const totalEntities = entities.length;

    // Calculate quotation percentage by status
    const pendingPercentage = totalQuotations > 0
        ? Math.round((pendingQuotations / totalQuotations) * 100)
        : 0;

    // Calculate financial stats
    const totalValue = Number(quotations.reduce((sum, q) => sum + (Number(q.total_amount) || 0), 0));
    const paidValue = Number(quotations
        .filter(q => q.is_paid || q.status === 'paid') // Consider both is_paid and status='paid'
        .reduce((sum, q) => sum + (Number(q.total_amount) || 0), 0));

    // Helper function to get entity name
    const getEntityNameById = (entityId: number | string) => {
        const entity = entities.find(e => e.id === entityId);
        return entity ? entity.name : 'Unknown';
    };
    return (
        <div className="bg-card p-4 sm:p-6 rounded-lg shadow-sm border border-border">
            <h2 className="text-xl font-medium mb-4 sm:mb-6 text-foreground flex items-center">
                <PieChart className="h-5 w-5 mr-2 text-primary" />
                Dashboard Overview
            </h2>

            {isLoading && (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">Loading dashboard data...</span>
                </div>
            )}

            {error && (
                <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-3 rounded mb-4">
                    {error}
                </div>
            )}

            {!isLoading && !error && (
                <>
                    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-100/20 dark:bg-blue-950/30 p-3 sm:p-4 rounded-lg border border-blue-200 dark:border-blue-900">
                            <h3 className="text-lg font-medium text-blue-700 dark:text-blue-400">Total Quotations</h3>
                            <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">{totalQuotations}</p>
                        </div>

                        <div className="bg-green-100/20 dark:bg-green-950/30 p-3 sm:p-4 rounded-lg border border-green-200 dark:border-green-900">
                            <h3 className="text-lg font-medium text-green-700 dark:text-green-400">Paid</h3>
                            <p className="text-2xl font-bold text-green-900 dark:text-green-300">
                                {paidQuotations} <span className="text-sm font-normal">
                                    ({totalQuotations > 0 ? Math.round((paidQuotations / totalQuotations) * 100) : 0}%)
                                </span>
                            </p>
                        </div>

                        <div className="bg-yellow-100/20 dark:bg-yellow-950/30 p-3 sm:p-4 rounded-lg border border-yellow-200 dark:border-yellow-900">
                            <h3 className="text-lg font-medium text-yellow-700 dark:text-amber-400">Pending</h3>
                            <p className="text-2xl font-bold text-yellow-900 dark:text-amber-300">
                                {pendingQuotations} <span className="text-sm font-normal">({pendingPercentage}%)</span>
                            </p>
                        </div>

                        <div className="bg-purple-100/20 dark:bg-purple-950/30 p-3 sm:p-4 rounded-lg border border-purple-200 dark:border-purple-900">
                            <h3 className="text-lg font-medium text-purple-700 dark:text-purple-400">Entities</h3>
                            <p className="text-2xl font-bold text-purple-900 dark:text-purple-300">{totalEntities}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-emerald-100/20 dark:bg-emerald-950/30 p-3 sm:p-4 rounded-lg border border-emerald-200 dark:border-emerald-900">
                            <h3 className="text-lg font-medium text-emerald-700 dark:text-emerald-400">Total Value</h3>
                            <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-300">₱{Number(totalValue).toFixed(2)}</p>
                        </div>

                        <div className="bg-indigo-100/20 dark:bg-indigo-950/30 p-3 sm:p-4 rounded-lg border border-indigo-200 dark:border-indigo-900">
                            <h3 className="text-lg font-medium text-indigo-700 dark:text-indigo-400">Payment Received</h3>
                            <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-300">₱{Number(paidValue).toFixed(2)}</p>
                        </div>

                        <div className="bg-rose-100/20 dark:bg-rose-950/30 p-3 sm:p-4 rounded-lg border border-rose-200 dark:border-rose-900">
                            <h3 className="text-lg font-medium text-rose-700 dark:text-rose-400">Unpaid Amount</h3>
                            <p className="text-2xl font-bold text-rose-900 dark:text-rose-300">₱{Number(totalValue - paidValue).toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-muted/20 p-3 sm:p-4 rounded-lg border border-border">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-foreground">Quick Actions</h3>
                            </div>
                            <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                                <Link to="/react-vite-supreme/admin/add-quotation">
                                    <Button variant="outline" className="w-full flex items-center justify-center">
                                        <FileText className="mr-2 h-4 w-4" /> New Quotation
                                    </Button>
                                </Link>
                                <Link to="/react-vite-supreme/admin/add-entity">
                                    <Button variant="outline" className="w-full flex items-center justify-center">
                                        <Users className="mr-2 h-4 w-4" /> New Entity
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <div className="bg-muted/20 p-3 sm:p-4 rounded-lg border border-border">
                            <h3 className="text-lg font-medium mb-3 sm:mb-4 text-foreground flex items-center">
                                <FileText className="h-5 w-5 mr-2 text-amber-600" />
                                Recent Quotations
                            </h3>
                            <div className="space-y-2">
                                {quotations.length === 0 ? (
                                    <p className="text-muted-foreground">No quotations yet</p>
                                ) : (
                                    quotations.slice(0, 5).map(quotation => (
                                        <div
                                            key={quotation.id}
                                            className="p-2 border-b border-border text-foreground flex flex-col xs:flex-row justify-between"
                                        >
                                            <div className="mb-1 xs:mb-0">
                                                <Link to={`/react-vite-supreme/admin/view-quotation/${quotation.id}`} className="hover:underline">
                                                    <span className="font-medium">{quotation.quotation_number}</span>
                                                </Link>
                                                <span className="text-muted-foreground text-sm ml-2">
                                                    ({getEntityNameById(quotation.entity)})
                                                </span>
                                                <div className="text-xs text-muted-foreground mt-0.5">
                                                    Issue: {new Date(quotation.issue_date).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${quotation.is_paid || quotation.status === 'paid'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                    : quotation.status === 'approved'
                                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                                        : quotation.status === 'pending'
                                                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                            : quotation.status === 'draft'
                                                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}
                                                >
                                                    {quotation.is_paid || quotation.status === 'paid'
                                                        ? 'Paid'
                                                        : quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                                                </span>
                                                <span className="text-muted-foreground text-sm ml-1">
                                                    ₱{Number(quotation.total_amount || 0).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-muted/20 p-3 sm:p-4 rounded-lg border border-border">
                            <h3 className="text-lg font-medium mb-2 text-foreground flex items-center">
                                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                                System Information
                            </h3>
                            <ul className="space-y-2">
                                <li className="p-2 border-b border-border text-foreground">Current Date: {new Date().toLocaleDateString()}</li>
                                <li className="p-2 border-b border-border text-foreground">Total Entities: {totalEntities}</li>
                                <li className="p-2 border-b border-border text-foreground">Total Quotations: {totalQuotations}</li>
                                <li className="p-2 text-foreground">
                                    Next Quotation Number: {quotations.length > 0 ? getNextQuotationNumber() : 'Loading...'}
                                </li>
                            </ul>
                        </div>

                        <div className="bg-muted/20 p-3 sm:p-4 rounded-lg border border-border">
                            <h3 className="text-lg font-medium mb-2 text-foreground flex items-center">
                                <BarChart3 className="h-5 w-5 mr-2 text-emerald-600" />
                                Payment Statistics
                            </h3>
                            <ul className="space-y-2">
                                <li className="p-2 border-b border-border text-foreground">
                                    Total Quotations: <span className="font-semibold">{totalQuotations}</span>
                                    <span className="text-xs ml-2">
                                        (Paid: {paidQuotations}, {totalQuotations > 0 ? Math.round((paidQuotations / totalQuotations) * 100) : 0}%)
                                    </span>
                                </li>
                                <li className="p-2 border-b border-border text-foreground">
                                    Total Revenue: <span className="font-semibold">₱{Number(totalValue).toFixed(2)}</span>
                                </li>
                                <li className="p-2 border-b border-border text-foreground">
                                    Paid: <span className="font-semibold text-green-600">₱{Number(paidValue).toFixed(2)}</span>
                                    <span className="text-xs ml-2">
                                        ({Number(totalValue) > 0 ? Math.round((Number(paidValue) / Number(totalValue)) * 100) : 0}%)
                                    </span>
                                </li>
                                <li className="p-2 text-foreground">
                                    Unpaid: <span className="font-semibold text-rose-600">₱{Number(totalValue - paidValue).toFixed(2)}</span>
                                    <span className="text-xs ml-2">
                                        ({Number(totalValue) > 0 ? Math.round(((Number(totalValue) - Number(paidValue)) / Number(totalValue)) * 100) : 0}%)
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Dashboard;