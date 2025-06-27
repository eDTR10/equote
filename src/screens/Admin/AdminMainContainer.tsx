import { useState, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import {
    LayoutDashboard,
    Users,
    FileText,
    Settings,
    BarChart3,
    LogOut,
    Menu,
    X
} from 'lucide-react';

const AdminMainContainer = () => {
    const navigate = useNavigate();
    const [activeMenuItem, setActiveMenuItem] = useState('Dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Check screen size on resize and initial load
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };

        // Initial check
        handleResize();

        // Add event listener
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Adding body overflow control when sidebar is open on mobile
    useEffect(() => {
        if (window.innerWidth < 768 && sidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [sidebarOpen]);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const menuItems = [
        { name: 'Dashboard', path: '/react-vite-supreme/admin/dashboard', icon: <LayoutDashboard className="mr-2 h-5 w-5" /> },
        { name: 'Entities', path: '/react-vite-supreme/admin/entities', icon: <Users className="mr-2 h-5 w-5" /> },
        { name: 'Add Entity', path: '/react-vite-supreme/admin/add-entity', icon: <Users className="mr-2 h-5 w-5" /> },
        { name: 'Add Quotation', path: '/react-vite-supreme/admin/add-quotation', icon: <FileText className="mr-2 h-5 w-5" /> },
        { name: 'Reports', path: '/react-vite-supreme/admin/reports', icon: <BarChart3 className="mr-2 h-5 w-5" /> },
        { name: 'Settings', path: '/react-vite-supreme/admin/settings', icon: <Settings className="mr-2 h-5 w-5" /> }
    ];

    const handleMenuClick = (item: { name: string; path: string }) => {
        setActiveMenuItem(item.name);
        navigate(item.path);

        // Auto close sidebar on mobile after navigation
        if (window.innerWidth < 768) {
            setSidebarOpen(false);
        }
    };

    const handleLogout = () => {
        // In a real app, handle logout logic here
        navigate('/react-vite-supreme/login');
    }; return (
        <div className="flex h-screen w-full bg-background overflow-hidden">
            {/* Sidebar - Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    onClick={toggleSidebar}
                ></div>
            )}

            {/* Sidebar */}
            <div
                className={`fixed z-30 bg-card dark:bg-card border-r border-border shadow-sm flex flex-col h-screen transition-all duration-300 ease-in-out ${sidebarOpen ? "w-64 left-0 overflow-y-auto" : "w-0 -left-64 md:left-0 md:w-20 md:overflow-y-auto"
                    }`}
            >
                <div className={`p-4 border-b border-border flex justify-between items-center ${!sidebarOpen && "md:justify-center"}`}>
                    {sidebarOpen ? (
                        <>
                            <div>
                                <h2 className="text-xl font-semibold text-foreground">eQuotation</h2>
                                <p className="text-sm text-muted-foreground">Admin Panel</p>
                            </div>
                            <button
                                onClick={toggleSidebar}
                                className="md:hidden p-1 rounded-full hover:bg-muted"
                                aria-label="Close sidebar"
                            >
                                <X className="h-5 w-5 text-muted-foreground" />
                            </button>
                        </>
                    ) : (
                        <div className="hidden md:block">
                            <h2 className="text-xl font-semibold text-foreground text-center">eQ</h2>
                        </div>
                    )}
                </div>

                <nav className="flex flex-col flex-grow justify-between">
                    <ul className="mt-6">
                        {menuItems.map((item) => (
                            <li key={item.name} className="mb-2">
                                <button
                                    onClick={() => handleMenuClick(item)}
                                    className={`flex items-center w-full px-4 py-2 text-left ${activeMenuItem === item.name
                                        ? 'bg-primary/10 text-primary font-medium'
                                        : 'text-muted-foreground hover:bg-muted'
                                        } ${!sidebarOpen && "md:justify-center"}`}
                                >
                                    {item.icon}
                                    {sidebarOpen && <span>{item.name}</span>}
                                </button>
                            </li>
                        ))}
                    </ul>

                    <div className="p-4 border-t border-border mt-auto">
                        <Button
                            variant="outline"
                            className={`w-full text-destructive hover:bg-destructive/10 hover:text-destructive flex ${sidebarOpen ? "items-center justify-center" : "md:justify-center"
                                }`}
                            onClick={handleLogout}
                        >
                            <LogOut className={sidebarOpen ? "mr-2 h-5 w-5" : "h-5 w-5"} />
                            {sidebarOpen && "Log Out"}
                        </Button>                    </div>
                </nav>
            </div>
            {/* Main content */}
            <div className={`flex-1 flex flex-col overflow-auto transition-all duration-300 ease-in-out ${sidebarOpen ? "ml-0 md:ml-64" : "ml-0 md:ml-20"
                }`}>
                <header className="bg-card dark:bg-card border-b border-border shadow-sm sticky top-0 z-10">
                    <div className="px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
                        <div className="flex items-center">
                            <button
                                onClick={toggleSidebar}
                                className="p-2 rounded-md hover:bg-muted mr-2 sm:mr-3 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
                                aria-label="Toggle sidebar"
                            >
                                <Menu className="h-5 w-5 text-foreground" />
                            </button>
                            <h1 className="text-xl sm:text-2xl font-semibold text-foreground truncate">{activeMenuItem}</h1>
                        </div>
                    </div>
                </header>

                <main className="p-3 sm:p-4 md:p-6 bg-background flex-1">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminMainContainer;