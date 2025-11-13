import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { useMockStore } from '../../store/useMockStore';
import { useToast } from '../../hooks/useToast';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import type { FileDoc, TaskItem } from '../../types/dealRoom';

const DOC_TAGS: FileDoc['tag'][] = ['Ops', 'Fire', 'Insurance', 'FitOut', 'Floorplan', 'Photo', 'Other'];
const TASK_GROUPS: TaskItem['group'][] = ['Legal', 'Ops', 'Landlord', 'Internal'];

export function DealRoomHomePage() {
  const { dealId } = useParams<{ dealId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { state, generateLegalPack, advanceAgreementStatus, uploadAgreementVersion, handoffToOps, updateHots, uploadDocument, addTask, updateTaskStatus } = useMockStore();
  const { showToast, toasts, removeToast, ToastComponent } = useToast();

  const activeTab = searchParams.get('tab') || 'overview';
  const setActiveTab = (tab: string) => {
    setSearchParams({ tab });
  };

  const deal = state.deal;
  const dealRoom = state.dealRoom;

  // Handoff conditions
  const allAgreementsSigned = dealRoom.agreements.length > 0 && dealRoom.agreements.every((a) => a.status === 'Signed');
  const allLegalTasksDone = dealRoom.tasks.filter((t) => t.group === 'Legal').every((t) => t.status === 'Done');
  const canHandoff = allAgreementsSigned && allLegalTasksDone;

  // Document filter
  const [docFilter, setDocFilter] = useState<FileDoc['tag'] | 'All'>('All');
  const filteredDocs = useMemo(() => {
    if (docFilter === 'All') return dealRoom.docs;
    return dealRoom.docs.filter((d) => d.tag === docFilter);
  }, [dealRoom.docs, docFilter]);

  // Hots edit mode
  const [editingHots, setEditingHots] = useState(false);
  const [hotsFields, setHotsFields] = useState(dealRoom.hots.fields);
  const editableFields = ['Term', 'Break', 'Indexation'];

  // Task form
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    assignee: '',
    group: 'Legal' as TaskItem['group'],
    due: '',
  });

  const handleGeneratePack = () => {
    if (!dealRoom.agreementPlan) {
      showToast('Please complete setup first', 'error');
      return;
    }
    generateLegalPack();
    showToast('Legal pack generated', 'success');
  };

  const handleAdvanceStatus = (id: string) => {
    advanceAgreementStatus(id);
    showToast('Agreement status updated', 'success');
  };

  const handleUploadVersion = (id: string) => {
    uploadAgreementVersion(id);
    showToast('New version uploaded', 'success');
  };

  const handleUploadDoc = () => {
    const name = `Document_${Date.now()}.pdf`;
    const tag = docFilter !== 'All' ? docFilter : 'Other';
    uploadDocument(name, tag);
    showToast('Document uploaded', 'success');
  };

  const handleSaveHots = () => {
    updateHots(hotsFields);
    setEditingHots(false);
    showToast('Heads of Terms updated', 'success');
  };

  const handleAddTask = () => {
    if (!newTask.title || !newTask.assignee) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    addTask({
      ...newTask,
      due: newTask.due || undefined,
      status: 'Open',
    });
    setNewTask({ title: '', assignee: '', group: 'Legal', due: '' });
    setShowTaskForm(false);
    showToast('Task added', 'success');
  };

  const handleHandoff = () => {
    if (!canHandoff) {
      showToast('Cannot handoff: all agreements must be signed and all Legal tasks completed', 'error');
      return;
    }
    handoffToOps();
    showToast('Handed off to Operations', 'success');
    navigate(`/deals/${dealId}/onboarding`);
  };

  const groupedTasks = useMemo(() => {
    const groups: Record<TaskItem['group'], TaskItem[]> = {
      Legal: [],
      Ops: [],
      Landlord: [],
      Internal: [],
    };
    dealRoom.tasks.forEach((task) => {
      groups[task.group].push(task);
    });
    return groups;
  }, [dealRoom.tasks]);

  return (
    <div className="px-8 py-6">
      <ToastComponent toasts={toasts} onRemove={removeToast} />
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-semibold text-primary mb-2">Deal Room</h1>
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-secondary">{deal.tenant.name}</span>
              <span className="text-secondary">•</span>
              <span className="text-secondary">
                {deal.property.name}
                {deal.property.unit && `, ${deal.property.unit}`}
              </span>
              <span className="text-secondary">•</span>
              <span className="text-secondary">
                £{deal.proposal.totals.monthly.toLocaleString()}/mo
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="outline">{deal.stage}</Badge>
            <Badge variant={dealRoom.status === 'handoff_ready' ? 'success' : 'default'}>
              {dealRoom.status.replace(/_/g, ' ')}
            </Badge>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" icon="fa-file">
            Add Document
          </Button>
          <Button variant="outline" size="sm" icon="fa-comment">
            Add Note
          </Button>
          <Button variant="outline" size="sm" icon="fa-user">
            Assign Owner
          </Button>
          {canHandoff && (
            <Button variant="primary" size="sm" icon="fa-arrow-right" onClick={handleHandoff}>
              Handoff to Ops
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Card className="sticky top-0 z-10">
        <Tabs key={activeTab} defaultTab={activeTab} className="bg-white" onTabChange={setActiveTab}>
          <div className="px-6 pt-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="agreements">Agreements</TabsTrigger>
              <TabsTrigger value="hots">Heads of Terms</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-primary mb-4">Proposal Summary</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="text-sm text-secondary mb-1">Monthly Total</div>
                      <div className="text-2xl font-semibold text-primary">
                        £{deal.proposal.totals.monthly.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="text-sm text-secondary mb-1">Setup Fee</div>
                      <div className="text-2xl font-semibold text-primary">
                        £{deal.proposal.totals.setup.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-primary mb-4">Key Dates</h2>
                  <div className="space-y-2">
                    <div className="flex justify-between py-2 border-b border-[#E6E6E6]">
                      <span className="text-sm text-secondary">Target Move-In</span>
                      <span className="text-sm text-primary">Q2 2024</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-[#E6E6E6]">
                      <span className="text-sm text-secondary">Contract Start</span>
                      <span className="text-sm text-primary">Q2 2024</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-primary mb-4">Stakeholders</h2>
                  <div className="space-y-2">
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-secondary">Tenant Contact</span>
                      <span className="text-sm text-primary">John Smith</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-secondary">Landlord Contact</span>
                      <span className="text-sm text-primary">Jane Doe</span>
                    </div>
                  </div>
                </div>

                {dealRoom.agreements.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-secondary mb-4">No agreements yet. Generate a legal pack to get started.</p>
                    <Button onClick={handleGeneratePack} icon="fa-file-contract">
                      Generate Legal Pack
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Agreements Tab */}
            <TabsContent value="agreements">
              {dealRoom.agreements.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-secondary mb-4">No agreements yet. Generate a legal pack to get started.</p>
                  <Button onClick={handleGeneratePack} icon="fa-file-contract">
                    Generate Legal Pack
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {dealRoom.agreements.map((agreement) => (
                    <Card key={agreement.id}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-base font-semibold text-primary">{agreement.name}</h3>
                            <Badge variant="outline">{agreement.kind}</Badge>
                            <Badge
                              variant={
                                agreement.status === 'Signed'
                                  ? 'success'
                                  : agreement.status === 'ReadyToSign'
                                    ? 'primary'
                                    : 'default'
                              }
                            >
                              {agreement.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-secondary space-y-1">
                            <div>
                              Latest version: {agreement.versions[agreement.versions.length - 1]?.name} (
                              {new Date(agreement.versions[agreement.versions.length - 1]?.uploadedAt).toLocaleDateString()}
                              )
                            </div>
                            {agreement.targetSignDate && (
                              <div>Target sign date: {agreement.targetSignDate}</div>
                            )}
                            <div>
                              Signers: {agreement.requiredSigners.map((s) => s.name).join(', ')}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          {agreement.status !== 'Signed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAdvanceStatus(agreement.id)}
                              icon="fa-arrow-right"
                            >
                              Advance status
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUploadVersion(agreement.id)}
                            icon="fa-upload"
                          >
                            Add version
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Heads of Terms Tab */}
            <TabsContent value="hots">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-primary">Heads of Terms</h2>
                    <p className="text-sm text-secondary">Version {dealRoom.hots.version}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!editingHots && (
                      <Button variant="outline" size="sm" onClick={() => setEditingHots(true)} icon="fa-edit">
                        Edit minor fields
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => showToast('Export PDF (mock)', 'info')}
                      icon="fa-download"
                    >
                      Export PDF
                    </Button>
                  </div>
                </div>

                <Card>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(dealRoom.hots.fields).map(([key, value]) => (
                      <div key={key}>
                        <div className="text-sm text-secondary mb-1">{key}</div>
                        {editingHots && editableFields.includes(key) ? (
                          <Input
                            value={hotsFields[key] || ''}
                            onChange={(e) => setHotsFields({ ...hotsFields, [key]: e.target.value })}
                          />
                        ) : (
                          <div className="text-base font-medium text-primary">{value}</div>
                        )}
                      </div>
                    ))}
                  </div>

                  {editingHots && (
                    <div className="flex justify-end space-x-2 mt-4">
                      <Button variant="outline" onClick={() => setEditingHots(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveHots}>Save</Button>
                    </div>
                  )}
                </Card>
              </div>
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-primary">Documents</h2>
                  <Button onClick={handleUploadDoc} icon="fa-upload">
                    Upload
                  </Button>
                </div>

                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-sm text-secondary">Filter:</span>
                  {['All', ...DOC_TAGS].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setDocFilter(tag as FileDoc['tag'] | 'All')}
                      className={`px-3 py-1 rounded-lg text-sm transition-all-smooth ${
                        docFilter === tag
                          ? 'bg-primary text-white'
                          : 'bg-muted text-primary hover:bg-[#E6E6E6]'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                {filteredDocs.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-secondary">No documents uploaded.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredDocs.map((doc) => (
                      <Card key={doc.id}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <i className="fa-solid fa-file text-secondary"></i>
                            <div>
                              <div className="text-sm font-medium text-primary">{doc.name}</div>
                              <div className="text-xs text-secondary">
                                {doc.tag} • v{doc.version} • {new Date(doc.uploadedAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <Badge variant="outline">{doc.tag}</Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-primary mb-4">Activity Timeline</h2>
                {dealRoom.activity.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-secondary">No activity yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dealRoom.activity.map((item) => (
                      <div key={item.id} className="flex items-start space-x-3 pb-3 border-b border-[#E6E6E6]">
                        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2"></div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium text-primary">{item.actor}</span>
                            <span className="text-xs text-secondary">
                              {new Date(item.at).toLocaleString()}
                            </span>
                            <Badge variant="outline" size="sm">
                              {item.type}
                            </Badge>
                          </div>
                          {item.note && <div className="text-sm text-secondary">{item.note}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Tasks Tab */}
            <TabsContent value="tasks">
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-primary">Tasks</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTaskForm(!showTaskForm)}
                    icon={showTaskForm ? 'fa-times' : 'fa-plus'}
                  >
                    {showTaskForm ? 'Cancel' : 'Add Task'}
                  </Button>
                </div>

                {showTaskForm && (
                  <Card className="mb-4">
                    <div className="space-y-4">
                      <Input
                        label="Title"
                        value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                        placeholder="Task title"
                      />
                      <Input
                        label="Assignee"
                        value={newTask.assignee}
                        onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                        placeholder="Assignee name"
                      />
                      <Select
                        label="Group"
                        options={TASK_GROUPS.map((g) => ({ value: g, label: g }))}
                        value={newTask.group}
                        onChange={(e) => setNewTask({ ...newTask, group: e.target.value as TaskItem['group'] })}
                      />
                      <Input
                        label="Due Date"
                        type="date"
                        value={newTask.due}
                        onChange={(e) => setNewTask({ ...newTask, due: e.target.value })}
                      />
                      <Button onClick={handleAddTask}>Add Task</Button>
                    </div>
                  </Card>
                )}

                {TASK_GROUPS.map((group) => {
                  const tasks = groupedTasks[group];
                  if (tasks.length === 0) return null;
                  return (
                    <div key={group}>
                      <h3 className="text-base font-semibold text-primary mb-3">{group}</h3>
                      <div className="space-y-2">
                        {tasks.map((task) => (
                          <Card key={task.id}>
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="text-sm font-medium text-primary mb-1">{task.title}</div>
                                <div className="text-xs text-secondary">
                                  {task.assignee}
                                  {task.due && ` • Due: ${new Date(task.due).toLocaleDateString()}`}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Select
                                  options={[
                                    { value: 'Open', label: 'Open' },
                                    { value: 'InProgress', label: 'In Progress' },
                                    { value: 'Blocked', label: 'Blocked' },
                                    { value: 'Done', label: 'Done' },
                                  ]}
                                  value={task.status}
                                  onChange={(e) =>
                                    updateTaskStatus(task.id, e.target.value as TaskItem['status'])
                                  }
                                  className="min-w-[140px]"
                                />
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </div>
  );
}

