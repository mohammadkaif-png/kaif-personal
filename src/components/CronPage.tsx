"use client"
import { useEffect, useState } from 'react';
import { Clock, Edit2, Trash2, Plus, X, Calendar, AlertCircle } from 'lucide-react';
import { createCronJobDB, deleteCronJobDB, fetchAllCronJobsDB, updateCronJobDB } from '@/lib/db';
import { CronJob } from '@prisma/client';


type FromData = {
    name: string,
    schedule: string,
    command: string,
    status: string,
    fileUrl: string | null
}

export default function CronJobManager() {
    const [cronJobs, setCronJobs] = useState<CronJob[]>([]);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedJob, setSelectedJob] = useState<CronJob | null>(null);
    const [formData, setFormData] = useState<FromData>({
        name: '',
        schedule: '',
        command: '',
        status: 'active',
        fileUrl: null
    });
    const [uploading, setUploading] = useState(false);



    const fetchCronJobs = async () => {
        try {
            const res = await fetchAllCronJobsDB()
            setCronJobs(res);
        } catch (error) {
            console.error("Failed to fetch cron jobs:", error);
        } finally {
        }
    };

    useEffect(() => {
        fetchCronJobs();
    }, []);


    const resetFormData = () => {
        setFormData({
            name: '',
            schedule: '',
            command: '',
            status: 'active',
            fileUrl: null
        });
    };

    const handleAddNew = () => {
        resetFormData();
        setShowAddModal(true);
    };


    const handleEdit = (job: CronJob) => {
        setSelectedJob(job);
        setFormData({
            name: job.name,
            schedule: job.schedule,
            command: job.command,
            status: job.status,
            fileUrl: job.fileUrl
        });
        setShowUpdateModal(true);
    };

    const handleDelete = (job: CronJob) => {
        setSelectedJob(job);
        setShowDeleteModal(true);
    };

    const handleAddSubmit = async () => {
        if (!formData.name || !formData.schedule || !formData.command) {
            alert('Please fill in all required fields');
            return;
        }

        await createCronJobDB(formData.name, formData.schedule, formData.command, formData.status,formData.fileUrl)
        setShowAddModal(false);
        await fetchCronJobs()
        resetFormData();
    };


    const handleUpdate = async () => {
        if (!selectedJob) return;

        try {
            await updateCronJobDB(
                selectedJob.id,
                formData.name,
                formData.schedule,
                formData.command,
                formData.status,
                formData.fileUrl
            );

            await fetchCronJobs();
            setShowUpdateModal(false);
            setSelectedJob(null);
        } catch (error) {
            console.error("Failed to update cron job:", error);
        }
    };


    const handleDeleteConfirm = async () => {
        if (!selectedJob) return;
        try {
            await deleteCronJobDB(selectedJob.id);
            await fetchCronJobs();
            setShowDeleteModal(false);
            setSelectedJob(null);
        } catch (error) {
            console.error("Failed to delete cron job:", error);
        }
    };


    const getStatusColor = (status: any) => {
        return status === 'active'
            ? 'bg-green-100 text-green-800 border-green-200'
            : 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const closeAllModals = () => {
        setShowAddModal(false);
        setShowUpdateModal(false);
        setShowDeleteModal(false);
        setSelectedJob(null);
    };


    const handleFileUpload = async (file: File) => {
        setUploading(true);
        const formDataUpload = new FormData();
        formDataUpload.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formDataUpload,
            });

            const data = await res.json();

            if (data.url) {
                setFormData((prev) => ({ ...prev, fileUrl: data.url }));
            } else {
                alert("Upload failed");
            }
        } catch (err) {
            console.error("Upload error:", err);
        } finally {
            setUploading(false);
        }
    };


    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <Clock className="text-blue-600" size={32} />
                                Cron Job Manager
                            </h1>
                            <p className="text-gray-600 mt-2">Manage and monitor your scheduled tasks</p>
                        </div>
                        <button
                            onClick={handleAddNew}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <Plus size={20} />
                            Add New Job
                        </button>
                    </div>
                </div>

                {/* Cron Jobs Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Cron Jobs ({cronJobs.length} total)
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Job Name</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Schedule</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Command</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Status</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">File</th>

                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {cronJobs.map((job) => (
                                    <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{job.name}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">
                                                {job.schedule}
                                            </code>
                                        </td>
                                        <td className="px-6 py-4">
                                            <code className="text-sm font-mono text-gray-600">{job.command}</code>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(job.status)}`}>
                                                {job.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {job.fileUrl ? (
                                                <a href={job.fileUrl} target="_blank" className="text-blue-600 underline">View</a>
                                            ) : (
                                                <span className="text-gray-400">No file</span>
                                            )}
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(job)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit job"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(job)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete job"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {cronJobs.length === 0 && (
                            <div className="text-center py-12">
                                <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No cron jobs yet</h3>
                                <p className="text-gray-500">Get started by adding your first scheduled task.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Add Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl max-w-md w-full p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-semibold text-gray-900">Add New Cron Job</h3>
                                <button
                                    onClick={closeAllModals}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Job Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                        placeholder="Enter job name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Schedule (Cron) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.schedule}
                                        onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-gray-900"
                                        placeholder="0 2 * * *"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Format: minute hour day month weekday
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Command <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.command}
                                        onChange={(e) => setFormData({ ...formData, command: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-gray-900"
                                        placeholder="Enter command to execute"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Attach File (optional)
                                    </label>
                                    <input
                                        type="file"
                                        onChange={(e) => {
                                            if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                                        }}
                                        className="w-full text-gray-900"
                                    />
                                    {uploading && <p className="text-sm text-gray-500 mt-2">Uploading...</p>}
                                    {formData.fileUrl && (
                                        <p className="text-sm text-green-600 mt-2">
                                            File uploaded: <a href={formData.fileUrl} target="_blank" className="underline">{formData.fileUrl}</a>
                                        </p>
                                    )}
                                </div>

                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={closeAllModals}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddSubmit}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                >
                                    Add Job
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Update Modal */}
                {showUpdateModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl max-w-md w-full p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-semibold text-gray-900">Update Cron Job</h3>
                                <button
                                    onClick={closeAllModals}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                        placeholder="Enter job name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Schedule (Cron)</label>
                                    <input
                                        type="text"
                                        value={formData.schedule}
                                        onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-gray-900"
                                        placeholder="0 2 * * *"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Command</label>
                                    <input
                                        type="text"
                                        value={formData.command}
                                        onChange={(e) => setFormData({ ...formData, command: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-gray-900"
                                        placeholder="Enter command to execute"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={closeAllModals}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                >
                                    Update Job
                                </button>

                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Attach File (optional)
                                </label>
                                <input
                                    type="file"
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                                    }}
                                    className="w-full text-gray-900"
                                />
                                {uploading && <p className="text-sm text-gray-500 mt-2">Uploading...</p>}
                                {formData.fileUrl && (
                                    <p className="text-sm text-green-600 mt-2">
                                        File uploaded: <a href={formData.fileUrl} target="_blank" className="underline">{formData.fileUrl}</a>
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl max-w-md w-full p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-red-100 rounded-full">
                                    <AlertCircle className="text-red-600" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900">Delete Cron Job</h3>
                                    <p className="text-gray-600 mt-1">This action cannot be undone</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <p className="text-sm text-gray-600 mb-2">You are about to delete:</p>
                                <div className="font-medium text-gray-900">{selectedJob?.name}</div>
                                <div className="text-sm text-gray-600 font-mono">{selectedJob?.schedule}</div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={closeAllModals}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteConfirm}
                                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                >
                                    Delete Job
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}