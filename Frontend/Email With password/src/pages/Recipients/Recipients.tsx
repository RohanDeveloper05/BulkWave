import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { List as ListIcon, Users, Upload, Plus, CreditCard as Tag } from 'lucide-react';
import clsx from 'clsx';
import { uploadRecipientList, fetchRecipientLists, deleteRecipientList } from "../../api/recipients";
import RecipientsListForm from "../../components/Recipients_list_form";
import EditRecipientsListForm from "../../components/EditRecipientsListForm";
import RecipientsLogs from './RecipientsLogs';
import AllListRecipients from './AllListRecipients';
import Lists from './Lists';
import Import from './Import';
import '../../styles/recipient.css';

export interface List {
    id: number;
    name: string;
    description: string;
    recipientCount: number;
    createdAt: string;
}

export default function Recipients() {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState<'recipients' | 'lists' | 'import' | 'allEmails'>('recipients');
    
    // Shared state for the Lists tab & Modals
    const [lists, setLists] = useState<List[]>([]);
    const [listsLoading, setListsLoading] = useState(false);
    const [showAddRecipient, setShowAddRecipient] = useState(false);
    const [editList, setEditList] = useState<List | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (location.state?.tab) {
            setActiveTab(location.state.tab);
        }
    }, [location.state]);

    const loadLists = async () => {
        try {
            setListsLoading(true);
            const data = await fetchRecipientLists();
            const mappedLists: List[] = data.results.map((item: any) => ({
                id: item.id,
                name: item.list_name,
                description: item.list_description,
                recipientCount: item.total_records,
                createdAt: new Date(item.created_at).toLocaleDateString()
            }));
            setLists(mappedLists);
        } catch (error) {
            console.error("Failed to load lists", error);
        } finally {
            setListsLoading(false);
        }
    };

    useEffect(() => {
        loadLists();
    }, []);

    const handleCreateList = async (formData: FormData) => {
        try {
            setLoading(true);
            const res = await uploadRecipientList(formData);
            alert(`List created: ${res.table_name}`);
            setShowAddRecipient(false);
            await loadLists();
            setActiveTab("lists");
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateList = async (formData: FormData) => {
        console.log("Updating list:", editList, formData);
        setEditList(null);
    };

    const handleDeleteList = async (id: number) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this list?");
        if (!confirmDelete) return;
        try {
            await deleteRecipientList(id);
            setLists(prev => prev.filter(list => list.id !== id));
            alert("List deleted successfully");
        } catch (err) {
            console.error(err);
            alert("Failed to delete list");
        }
    };

    return (
        <div className="space-y-6">
            
            {/* COMPACT HEADER (Matches Compose.tsx) */}
            <div className="compose-header flex-col sm:flex-row items-start sm:items-center gap-4">
                <div>
                    <h1 className="dashboard-title">Recipients</h1>
                    <p className="dashboard-subtitle">
                        Manage your email recipients and lists
                    </p>
                </div>
                <button
                    onClick={() => setShowAddRecipient(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2 w-full sm:w-auto bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors shadow-sm"
                >
                    <Plus className="h-4 w-4" />
                    Create List
                </button>
            </div>

            {/* Modals */}
            <RecipientsListForm
                open={showAddRecipient}
                onClose={() => setShowAddRecipient(false)}
                onSave={handleCreateList}
            />
            <EditRecipientsListForm
                open={!!editList}
                list={editList}
                onClose={() => setEditList(null)}
                onSave={(_, data) => handleUpdateList(data)}
            />

            {loading && (
                <div className="text-sm font-medium text-blue-600 dark:text-blue-400 animate-pulse">
                    Uploading file...
                </div>
            )}

            {/* TABS STYLED AS RECIPIENT CARDS (Matches your CSS) */}
            <div className="recipient-options">
                {[
                    { id: 'recipients', name: 'Recipients Logs', desc: 'Delivery history', icon: Users },
                    { id: 'allEmails', name: 'All List', desc: 'Master directory', icon: ListIcon },
                    { id: 'lists', name: 'Lists', desc: 'Manage segments', icon: Tag },
                    { id: 'import', name: 'Import', desc: 'Add new users', icon: Upload }
                ].map((tab) => (
                    <div
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={clsx(
                            'recipient-option',
                            activeTab === tab.id && 'recipient-option-active'
                        )}
                    >
                        <div className="recipient-icon">
                            <tab.icon className="h-5 w-5" />
                        </div>
                        <div>
                            <h4>{tab.name}</h4>
                            <p>{tab.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tab Contents */}
            <div className="mt-4">
                {activeTab === 'recipients' && <RecipientsLogs />}
                {activeTab === 'allEmails' && <AllListRecipients isActive={activeTab === 'allEmails'} />}
                {activeTab === 'lists' && (
                    <Lists 
                        lists={lists} 
                        listsLoading={listsLoading} 
                        setEditList={setEditList} 
                        handleDeleteList={handleDeleteList} 
                    />
                )}
                {activeTab === 'import' && <Import />}
            </div>
        </div>
    );
}