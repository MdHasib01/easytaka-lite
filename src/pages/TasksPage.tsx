import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { useTaskStore } from '../stores/useTaskStore';
import { TaskCard } from '../components/tasks/TaskCard';
import { CreateTaskModal } from '../components/tasks/CreateTaskModal';
import { SubmitProofModal } from '../components/tasks/SubmitProofModal';
import { Button } from '../components/ui/Button';
import { Task, TaskType } from '../types';
import {
  CheckSquare,
  PlusCircle,
  Search,
  Filter,
  Coins,
  Sparkles,
  Layers,
} from 'lucide-react';

export const TasksPage: React.FC = () => {
  const { user } = useAuthStore();
  const { tasks, fetchTasks, createTask, updateTask, deleteTask, submitProof, isLoading } =
    useTaskStore();

  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [proofModalTask, setProofModalTask] = useState<Task | null>(null);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter((task) => {
    // Type filter
    if (activeTab === 'create_account' && task.taskType !== 'create_account') return false;
    if (activeTab === 'comment_post' && task.taskType !== 'comment_post') return false;
    if (activeTab === 'community_reply' && task.taskType !== 'community_reply') return false;
    if (activeTab === 'my_pending' && task.mySubmission?.status !== 'pending') return false;
    if (activeTab === 'my_approved' && task.mySubmission?.status !== 'approved') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(q) ||
        task.description.toLowerCase().includes(q) ||
        task.category?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Facebook Tasks Hub
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {tasks.length} Available
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isAdmin
              ? 'Create, assign, and broadcast engagement tasks to your SMM team.'
              : 'Complete assigned Facebook tasks, provide proof links and screenshots to earn points.'}
          </p>
        </div>

        {isAdmin && (
          <Button
            variant="glow"
            onClick={() => {
              setEditingTask(null);
              setCreateModalOpen(true);
            }}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Create Task
          </Button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-2xl p-3 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'All Tasks' },
            { id: 'create_account', label: 'Account Creation' },
            { id: 'comment_post', label: 'Post Comments' },
            { id: 'community_reply', label: 'Community Replies' },
            ...(!isAdmin
              ? [
                  { id: 'my_pending', label: 'Under Review' },
                  { id: 'my_approved', label: 'Completed' },
                ]
              : []),
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-glow-brand font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full px-3.5 py-2 pl-9 rounded-xl glass-input text-xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Task Grid */}
      {filteredTasks.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-dashed border-slate-800 space-y-3">
          <CheckSquare className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Tasks Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? 'No tasks matched your search query.'
              : 'No tasks currently match this category.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              userRole={user?.role || 'smm'}
              onSubmitProof={(t) => setProofModalTask(t)}
              onEdit={(t) => {
                setEditingTask(t);
                setCreateModalOpen(true);
              }}
              onDelete={deleteTask}
            />
          ))}
        </div>
      )}

      {/* Proof Submission Modal */}
      <SubmitProofModal
        isOpen={!!proofModalTask}
        onClose={() => setProofModalTask(null)}
        task={proofModalTask}
        onSubmit={submitProof}
      />

      {/* Create / Edit Modal */}
      <CreateTaskModal
        isOpen={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          setEditingTask(null);
        }}
        initialTask={editingTask}
        onSubmit={async (data) => {
          if (editingTask) {
            return updateTask(editingTask._id, data);
          } else {
            return createTask(data);
          }
        }}
      />
    </div>
  );
};
