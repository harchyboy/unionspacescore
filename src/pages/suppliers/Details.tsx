import { useState } from 'react';
import { useSupplierWorkOrders, useSupplierPerformance, useSupplierCommunications } from '../../api/suppliers';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '../../components/ui/Table';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import type { Supplier } from '../../types/supplier';

interface SupplierDetailsProps {
  supplier: Supplier;
  onBack: () => void;
}

type TabValue = 'work-orders' | 'performance' | 'contracts' | 'people' | 'communications';

export function SupplierDetails({ supplier, onBack }: SupplierDetailsProps) {
  const [activeTab, setActiveTab] = useState<TabValue>('work-orders');

  const { data: workOrders, isLoading: workOrdersLoading } = useSupplierWorkOrders(supplier.id);
  const { data: performance, isLoading: performanceLoading } = useSupplierPerformance(supplier.id);
  const { data: communications, isLoading: communicationsLoading } = useSupplierCommunications(supplier.id);

  const primaryContact = supplier.contacts.find((c) => c.isPrimary) || supplier.contacts[0];

  // Render stars for rating
  const renderRating = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <i
            key={i}
            className={`fa-solid fa-star text-sm ${
              i < fullStars
                ? 'text-yellow-500'
                : i === fullStars && hasHalfStar
                ? 'text-yellow-500'
                : 'text-secondary'
            }`}
          ></i>
        ))}
        <span className="text-sm text-secondary ml-1">{rating}</span>
      </div>
    );
  };

  // Get status color for work order badges
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'In Progress':
        return 'bg-[#F0F0F0] text-[#252525] border border-[#8E8E8E]';
      case 'Scheduled':
        return 'bg-[#F0F0F0] text-[#252525] border border-[#252525]';
      case 'Awaiting Parts':
        return 'bg-white text-[#252525] border border-[#252525]';
      case 'Completed':
        return 'bg-[#252525] text-white';
      case 'Pending':
        return 'bg-[#F0F0F0] text-[#252525]';
      default:
        return 'bg-[#F0F0F0] text-[#252525]';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Page Header */}
      <div className="bg-white border-b border-[#E6E6E6] px-8 py-6">
        <div className="flex items-center space-x-4 mb-4">
          <button onClick={onBack} className="text-secondary hover:text-primary">
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-semibold text-primary">{supplier.name}</h1>
              <Badge variant="default">{supplier.category}</Badge>
              <Badge variant={supplier.contractStatus === 'Active' ? 'primary' : 'secondary'}>
                {supplier.contractStatus} Contract
              </Badge>
              {supplier.rating && renderRating(supplier.rating)}
            </div>
            <p className="text-secondary text-sm">
              {supplier.description || `${supplier.category} provider covering ${supplier.coverage.join(', ')}`}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button icon="fa-plus">New Work Order</Button>
          <Button variant="outline" icon="fa-share-nodes">
            Share Scope
          </Button>
          <Button variant="outline" icon="fa-pause">
            Pause
          </Button>
          <div className="flex-1"></div>
          <button className="text-secondary hover:text-primary">
            <i className="fa-solid fa-ellipsis-vertical text-xl"></i>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-4 mt-6 border-t border-[#E6E6E6] pt-4">
          <button
            onClick={() => setActiveTab('work-orders')}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === 'work-orders'
                ? 'text-primary border-primary'
                : 'text-secondary border-transparent hover:text-primary hover:border-secondary'
            } transition-all`}
          >
            Work Orders
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === 'performance'
                ? 'text-primary border-primary'
                : 'text-secondary border-transparent hover:text-primary hover:border-secondary'
            } transition-all`}
          >
            Performance
          </button>
          <button
            onClick={() => setActiveTab('contracts')}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === 'contracts'
                ? 'text-primary border-primary'
                : 'text-secondary border-transparent hover:text-primary hover:border-secondary'
            } transition-all`}
          >
            Contracts & Docs
          </button>
          <button
            onClick={() => setActiveTab('people')}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === 'people'
                ? 'text-primary border-primary'
                : 'text-secondary border-transparent hover:text-primary hover:border-secondary'
            } transition-all`}
          >
            People
          </button>
          <button
            onClick={() => setActiveTab('communications')}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === 'communications'
                ? 'text-primary border-primary'
                : 'text-secondary border-transparent hover:text-primary hover:border-secondary'
            } transition-all`}
          >
            Communications
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto bg-[#F0F0F0] px-8 py-6">
        {/* Stats Cards - Always visible */}
        <div className="grid grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-secondary text-sm font-medium">Active Work Orders</div>
                <i className="fa-solid fa-clipboard-list text-primary"></i>
              </div>
              <div className="text-3xl font-semibold text-primary">
                {performanceLoading ? '-' : performance?.activeWorkOrders || supplier.openWorkOrders}
              </div>
              <div className="text-xs text-secondary mt-2">
                {performanceLoading ? '-' : `${performance?.dueThisWeek || 0} due this week`}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-secondary text-sm font-medium">Avg Response Time</div>
                <i className="fa-solid fa-clock text-primary"></i>
              </div>
              <div className="text-3xl font-semibold text-primary">
                {performanceLoading ? '-' : performance?.avgResponseTime || '2.4h'}
              </div>
              <div className="text-xs text-secondary mt-2">
                Target: {performance?.responseTarget || `${supplier.responseTimeTarget}h`}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-secondary text-sm font-medium">On-Time Completion</div>
                <i className="fa-solid fa-check-circle text-primary"></i>
              </div>
              <div className="text-3xl font-semibold text-primary">
                {performanceLoading ? '-' : `${performance?.onTimeCompletion || supplier.slaPercentage}%`}
              </div>
              <div className="text-xs text-secondary mt-2">
                {performanceLoading ? '-' : performance?.onTimeChange || '+5% vs last month'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-secondary text-sm font-medium">Contract Value</div>
                <i className="fa-solid fa-pound-sign text-primary"></i>
              </div>
              <div className="text-3xl font-semibold text-primary">
                {performanceLoading ? '-' : performance?.contractValue || '£48k'}
              </div>
              <div className="text-xs text-secondary mt-2">
                {performanceLoading ? '-' : performance?.contractPeriod || 'Annual commitment'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Content */}
        {activeTab === 'work-orders' && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-primary">Active Work Orders</h2>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <select className="appearance-none bg-[#FAFAFA] border border-[#E6E6E6] rounded-lg px-4 py-2 pr-8 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary">
                      <option>All Properties</option>
                      <option>99 Bishopsgate</option>
                      <option>One Canada Square</option>
                      <option>Principal Place</option>
                    </select>
                    <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary text-xs pointer-events-none"></i>
                  </div>
                  <div className="relative">
                    <select className="appearance-none bg-[#FAFAFA] border border-[#E6E6E6] rounded-lg px-4 py-2 pr-8 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary">
                      <option>All Statuses</option>
                      <option>Pending</option>
                      <option>In Progress</option>
                      <option>Awaiting Parts</option>
                      <option>Completed</option>
                    </select>
                    <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary text-xs pointer-events-none"></i>
                  </div>
                </div>
              </div>

              {workOrdersLoading ? (
                <div className="flex items-center justify-center h-32">
                  <LoadingSpinner />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableHeaderCell>WO Number</TableHeaderCell>
                      <TableHeaderCell>Property / Unit</TableHeaderCell>
                      <TableHeaderCell>Description</TableHeaderCell>
                      <TableHeaderCell>Status</TableHeaderCell>
                      <TableHeaderCell>SLA Timer</TableHeaderCell>
                      <TableHeaderCell>Assigned To</TableHeaderCell>
                      <TableHeaderCell>Attachments</TableHeaderCell>
                      <TableHeaderCell align="right">Actions</TableHeaderCell>
                    </TableHeader>
                    <TableBody>
                      {workOrders?.map((wo) => (
                        <TableRow key={wo.id}>
                          <TableCell>
                            <div className="font-semibold text-primary text-sm">{wo.number}</div>
                            <div className="text-xs text-secondary">Created {wo.createdAt}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-primary font-medium">{wo.property}</div>
                            <div className="text-xs text-secondary">{wo.unit}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-primary">{wo.description}</div>
                            <div className="text-xs text-secondary">{wo.details}</div>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded text-[11px] font-bold uppercase tracking-wider ${getStatusBadgeClass(
                                wo.status
                              )}`}
                            >
                              {wo.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            {wo.status === 'Completed' ? (
                              <div className="flex items-center space-x-2">
                                <i className="fa-solid fa-check-circle text-green-600"></i>
                                <span className="text-xs text-secondary">On time</span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <div className="w-16 bg-muted rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${
                                      wo.slaPercentUsed && wo.slaPercentUsed > 90
                                        ? 'bg-destructive'
                                        : 'bg-primary'
                                    }`}
                                    style={{ width: `${wo.slaPercentUsed || 0}%` }}
                                  ></div>
                                </div>
                                <span
                                  className={`text-xs ${
                                    wo.slaPercentUsed && wo.slaPercentUsed > 90
                                      ? 'text-destructive'
                                      : 'text-secondary'
                                  }`}
                                >
                                  {wo.slaTimeLeft}
                                </span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {wo.assignedTo && (
                              <div className="flex items-center space-x-2">
                                {wo.assignedTo.avatar ? (
                                  <img
                                    src={wo.assignedTo.avatar}
                                    alt={wo.assignedTo.name}
                                    className="w-7 h-7 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs font-semibold">
                                      {wo.assignedTo.name.charAt(0)}
                                    </span>
                                  </div>
                                )}
                                <div className="text-sm text-primary">{wo.assignedTo.name}</div>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {wo.attachments && wo.attachments > 0 && (
                              <div className="flex items-center space-x-1">
                                <i className="fa-solid fa-paperclip text-secondary text-xs"></i>
                                <span className="text-xs text-secondary">{wo.attachments}</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <button className="text-secondary hover:text-primary">
                              <i className="fa-solid fa-ellipsis-vertical"></i>
                            </button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'performance' && (
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-primary mb-6">Performance Metrics</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-secondary">On-Time Delivery</span>
                      <span className="text-sm font-semibold text-primary">
                        {performance?.onTimeDelivery || supplier.slaPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${performance?.onTimeDelivery || supplier.slaPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-secondary">First-Time Fix Rate</span>
                      <span className="text-sm font-semibold text-primary">
                        {performance?.firstTimeFixRate || 88}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${performance?.firstTimeFixRate || 88}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-secondary">Customer Satisfaction</span>
                      <span className="text-sm font-semibold text-primary">
                        {performance?.customerSatisfaction || supplier.rating}/5.0
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${((performance?.customerSatisfaction || supplier.rating || 4) / 5) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-primary mb-6">Performance by Property</h3>
                {performanceLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#E6E6E6]">
                          <th className="text-left py-2 text-xs font-semibold text-secondary uppercase">
                            Property
                          </th>
                          <th className="text-left py-2 text-xs font-semibold text-secondary uppercase">
                            On-Time %
                          </th>
                          <th className="text-left py-2 text-xs font-semibold text-secondary uppercase">
                            Rating
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {performance?.propertyPerformance?.map((pp) => (
                          <tr key={pp.property} className="border-b border-[#E6E6E6]">
                            <td className="py-3 text-primary font-medium">{pp.property}</td>
                            <td className="py-3">
                              <div className="flex items-center space-x-2">
                                <div className="w-16 bg-muted rounded-full h-2">
                                  <div
                                    className="bg-primary h-2 rounded-full"
                                    style={{ width: `${pp.onTimePercent}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-secondary">{pp.onTimePercent}%</span>
                              </div>
                            </td>
                            <td className="py-3">
                              <div className="flex items-center space-x-1">
                                <i className="fa-solid fa-star text-yellow-500 text-xs"></i>
                                <span className="text-primary">{pp.rating}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'contracts' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {supplier.contracts?.map((contract) => (
                <Card key={contract.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-sm font-semibold text-primary">{contract.name}</div>
                        <div className="text-xs text-secondary mt-1">{contract.type}</div>
                      </div>
                      <Badge variant={contract.status === 'Active' ? 'primary' : 'secondary'}>
                        {contract.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {contract.value && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-secondary">Contract Value:</span>
                          <span className="text-primary font-medium">{contract.value}</span>
                        </div>
                      )}
                      {contract.startDate && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-secondary">Start Date:</span>
                          <span className="text-primary">{contract.startDate}</span>
                        </div>
                      )}
                      {contract.renewalDate && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-secondary">Renewal Date:</span>
                          <span className="text-primary font-medium">{contract.renewalDate}</span>
                        </div>
                      )}
                      {contract.noticePeriod && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-secondary">Notice Period:</span>
                          <span className="text-primary">{contract.noticePeriod}</span>
                        </div>
                      )}
                      {contract.responseTarget && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-secondary">Response Target:</span>
                          <span className="text-primary font-medium">{contract.responseTarget}</span>
                        </div>
                      )}
                      {contract.resolutionTarget && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-secondary">Resolution Target:</span>
                          <span className="text-primary font-medium">{contract.resolutionTarget}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 pt-4 border-t border-[#E6E6E6]">
                      <button className="text-xs text-primary hover:underline">View Contract</button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {supplier.specialArrangement && (
              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3">
                    <i className="fa-solid fa-info-circle text-yellow-600 mt-1"></i>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-primary mb-1">
                        Special Arrangement: Direct UNION Agreement
                      </div>
                      <div className="text-xs text-secondary">{supplier.specialArrangement}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Documents */}
            <Card>
              <CardContent className="p-6">
                <h4 className="text-sm font-semibold text-primary mb-4">Documents</h4>
                <div className="space-y-2">
                  {supplier.documents?.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 border border-[#E6E6E6] rounded-lg hover:bg-muted transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <i className="fa-solid fa-file-pdf text-destructive"></i>
                        <div>
                          <div className="text-sm text-primary">{doc.name}</div>
                          <div className="text-xs text-secondary">Uploaded {doc.uploadedAt}</div>
                        </div>
                      </div>
                      <button className="text-secondary hover:text-primary">
                        <i className="fa-solid fa-download"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'people' && (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-primary mb-6">People & Escalation</h3>

              <div className="grid grid-cols-3 gap-6 mb-6">
                {supplier.contacts.map((contact) => (
                  <div key={contact.id} className="border border-[#E6E6E6] rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      {contact.avatar ? (
                        <img
                          src={contact.avatar}
                          alt={contact.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {contact.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-semibold text-primary">{contact.name}</div>
                        <div className="text-xs text-secondary">{contact.role}</div>
                      </div>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center space-x-2">
                        <i className="fa-solid fa-envelope text-secondary w-4"></i>
                        <span className="text-primary">{contact.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <i className="fa-solid fa-phone text-secondary w-4"></i>
                        <span className="text-primary">{contact.phone}</span>
                      </div>
                      {contact.mobile && (
                        <div className="flex items-center space-x-2">
                          <i className="fa-solid fa-mobile text-secondary w-4"></i>
                          <span className="text-primary">{contact.mobile}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 pt-4 border-t border-[#E6E6E6]">
                      <Badge variant={contact.isPrimary ? 'primary' : 'default'}>
                        {contact.isPrimary ? 'Primary Contact' : contact.role}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              {/* Escalation Matrix */}
              <div className="border border-[#E6E6E6] rounded-lg p-4">
                <h4 className="text-sm font-semibold text-primary mb-3">Escalation Matrix</h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold">
                      1
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-primary font-medium">
                        Standard Issues (0-4h SLA breach)
                      </div>
                      <div className="text-xs text-secondary mt-1">
                        Contact: {primaryContact?.name} ({primaryContact?.role})
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold">
                      2
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-primary font-medium">
                        Urgent Issues (4-8h SLA breach)
                      </div>
                      <div className="text-xs text-secondary mt-1">
                        Contact: {supplier.contacts[1]?.name || 'Technical Lead'} +{' '}
                        {primaryContact?.name}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-destructive text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold">
                      3
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-primary font-medium">
                        Critical Issues (8h+ SLA breach)
                      </div>
                      <div className="text-xs text-secondary mt-1">
                        Contact: {supplier.contacts[2]?.name || 'Operations Director'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'communications' && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-primary">Communications</h3>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" icon="fa-filter">
                    Filter
                  </Button>
                  <Button size="sm" icon="fa-plus">
                    New Message
                  </Button>
                </div>
              </div>

              {communicationsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <LoadingSpinner />
                </div>
              ) : (
                <div className="space-y-4">
                  {communications?.map((comm) => (
                    <div
                      key={comm.id}
                      className="border border-[#E6E6E6] rounded-lg p-4 hover:bg-muted transition-all"
                    >
                      <div className="flex items-start space-x-4">
                        {comm.senderAvatar ? (
                          <img
                            src={comm.senderAvatar}
                            alt={comm.senderName}
                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-semibold text-sm">
                              {comm.senderName.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <span className="text-sm font-semibold text-primary">
                                {comm.senderName}
                              </span>
                              <span className="text-xs text-secondary ml-2">via {comm.type}</span>
                            </div>
                            <span className="text-xs text-secondary">{comm.timestamp}</span>
                          </div>
                          <div className="text-sm text-primary font-medium mb-1">{comm.subject}</div>
                          <div className="text-sm text-secondary">{comm.content}</div>
                          <div className="flex items-center space-x-4 mt-3">
                            <button className="text-xs text-primary hover:underline flex items-center space-x-1">
                              <i className="fa-solid fa-reply"></i>
                              <span>Reply</span>
                            </button>
                            {comm.attachments && comm.attachments > 0 && (
                              <button className="text-xs text-primary hover:underline flex items-center space-x-1">
                                <i className="fa-solid fa-paperclip"></i>
                                <span>{comm.attachments} attachments</span>
                              </button>
                            )}
                            {comm.status && (
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded text-[11px] font-bold uppercase tracking-wider ${getStatusBadgeClass(
                                  comm.status
                                )}`}
                              >
                                {comm.status}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 text-center">
                <button className="text-sm text-primary hover:underline">Load more messages</button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

