"use client";

import {
  Activity,
  Attachment,
  CallLog,
  Contact,
  Deal,
  Lead,
  Note,
  Organization,
  Task,
  initialActivities,
  initialAttachments,
  initialCallLogs,
  initialContacts,
  initialDeals,
  initialLeads,
  initialNotes,
  initialOrganizations,
  initialTasks,
} from "@/lib/data";
import React, { createContext, useContext, useState, useCallback } from "react";

interface CRMContextType {
  leads: Lead[];
  deals: Deal[];
  contacts: Contact[];
  organizations: Organization[];
  notes: Note[];
  tasks: Task[];
  activities: Activity[];
  callLogs: CallLog[];
  attachments: Attachment[];

  // Lead operations
  addLead: (lead: Omit<Lead, "id" | "createdAt" | "updatedAt">) => void;
  updateLead: (id: string, lead: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  getLead: (id: string) => Lead | undefined;

  // Deal operations
  addDeal: (deal: Omit<Deal, "id" | "createdAt" | "updatedAt">) => void;
  updateDeal: (id: string, deal: Partial<Deal>) => void;
  deleteDeal: (id: string) => void;
  getDeal: (id: string) => Deal | undefined;

  // Contact operations
  addContact: (
    contact: Omit<Contact, "id" | "createdAt" | "updatedAt">,
  ) => void;
  updateContact: (id: string, contact: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  getContact: (id: string) => Contact | undefined;

  // Organization operations
  addOrganization: (
    organization: Omit<Organization, "id" | "createdAt" | "updatedAt">,
  ) => void;
  updateOrganization: (id: string, organization: Partial<Organization>) => void;
  deleteOrganization: (id: string) => void;
  getOrganization: (id: string) => Organization | undefined;

  // Note operations
  addNote: (note: Omit<Note, "id" | "createdAt" | "updatedAt">) => void;
  updateNote: (id: string, note: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  getNotesByEntity: (entityType: string, entityId: string) => Note[];

  // Task operations
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  getTasksByEntity: (entityType: string, entityId: string) => Task[];

  // Activity operations
  addActivity: (activity: Omit<Activity, "id" | "createdAt">) => void;
  getActivitiesByEntity: (entityType: string, entityId: string) => Activity[];

  // Call log operations
  addCallLog: (callLog: Omit<CallLog, "id" | "createdAt">) => void;
  getCallLogsByLead: (leadId: string) => CallLog[];
  getCallLogsByEntity: (entityType: string, entityId: string) => CallLog[];

  // Attachment operations
  addAttachment: (attachment: Omit<Attachment, "id" | "uploadedAt">) => void;
  getAttachmentsByLead: (leadId: string) => Attachment[];
  getAttachmentsByEntity: (
    entityType: string,
    entityId: string,
  ) => Attachment[];

  // Dashboard stats
  getDashboardStats: () => {
    totalLeads: number;
    totalDeals: number;
    ongoingDeals: number;
    wonDeals: number;
    lostDeals: number;
    averageTimeToCloseLead: number;
    averageTimeToCloseDeal: number;
    averageDealValue: number;
    averageWonDealValue: number;
  };

  // Sales trend data
  getSalesTrend: () => { month: string; revenue: number; deals: number }[];
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export function CRMProvider({ children }: { children: React.ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [organizations, setOrganizations] =
    useState<Organization[]>(initialOrganizations);
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [callLogs, setCallLogs] = useState<CallLog[]>(initialCallLogs);
  const [attachments, setAttachments] =
    useState<Attachment[]>(initialAttachments);

  // Lead operations
  const addLead = useCallback(
    (lead: Omit<Lead, "id" | "createdAt" | "updatedAt">) => {
      const newLead: Lead = {
        ...lead,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setLeads((prev) => [...prev, newLead]);
    },
    [],
  );

  const updateLead = useCallback((id: string, leadUpdate: Partial<Lead>) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === id
          ? { ...lead, ...leadUpdate, updatedAt: new Date() }
          : lead,
      ),
    );
  }, []);

  const deleteLead = useCallback((id: string) => {
    setLeads((prev) => prev.filter((lead) => lead.id !== id));
  }, []);

  const getLead = useCallback(
    (id: string) => {
      return leads.find((lead) => lead.id === id);
    },
    [leads],
  );

  // Deal operations
  const addDeal = useCallback(
    (deal: Omit<Deal, "id" | "createdAt" | "updatedAt">) => {
      const newDeal: Deal = {
        ...deal,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setDeals((prev) => [...prev, newDeal]);
    },
    [],
  );

  const updateDeal = useCallback((id: string, dealUpdate: Partial<Deal>) => {
    setDeals((prev) =>
      prev.map((deal) => {
        if (deal.id === id) {
          const updated = { ...deal, ...dealUpdate, updatedAt: new Date() };
          if (
            dealUpdate.status === "won" ||
            dealUpdate.status === "lost" ||
            dealUpdate.status === "closed"
          ) {
            updated.closedAt = new Date();
          }
          return updated;
        }
        return deal;
      }),
    );
  }, []);

  const deleteDeal = useCallback((id: string) => {
    setDeals((prev) => prev.filter((deal) => deal.id !== id));
  }, []);

  const getDeal = useCallback(
    (id: string) => {
      return deals.find((deal) => deal.id === id);
    },
    [deals],
  );

  // Contact operations
  const addContact = useCallback(
    (contact: Omit<Contact, "id" | "createdAt" | "updatedAt">) => {
      const newContact: Contact = {
        ...contact,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setContacts((prev) => [...prev, newContact]);
    },
    [],
  );

  const updateContact = useCallback(
    (id: string, contactUpdate: Partial<Contact>) => {
      setContacts((prev) =>
        prev.map((contact) =>
          contact.id === id
            ? { ...contact, ...contactUpdate, updatedAt: new Date() }
            : contact,
        ),
      );
    },
    [],
  );

  const deleteContact = useCallback((id: string) => {
    setContacts((prev) => prev.filter((contact) => contact.id !== id));
  }, []);

  const getContact = useCallback(
    (id: string) => {
      return contacts.find((contact) => contact.id === id);
    },
    [contacts],
  );

  // Organization operations
  const addOrganization = useCallback(
    (organization: Omit<Organization, "id" | "createdAt" | "updatedAt">) => {
      const newOrganization: Organization = {
        ...organization,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setOrganizations((prev) => [...prev, newOrganization]);
    },
    [],
  );

  const updateOrganization = useCallback(
    (id: string, organizationUpdate: Partial<Organization>) => {
      setOrganizations((prev) =>
        prev.map((organization) =>
          organization.id === id
            ? {
                ...organization,
                ...organizationUpdate,
                updatedAt: new Date(),
              }
            : organization,
        ),
      );
    },
    [],
  );

  const deleteOrganization = useCallback((id: string) => {
    setOrganizations((prev) =>
      prev.filter((organization) => organization.id !== id),
    );
  }, []);

  const getOrganization = useCallback(
    (id: string) => {
      return organizations.find((organization) => organization.id === id);
    },
    [organizations],
  );

  // Note operations
  const addNote = useCallback(
    (note: Omit<Note, "id" | "createdAt" | "updatedAt">) => {
      const newNote: Note = {
        ...note,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setNotes((prev) => [...prev, newNote]);
    },
    [],
  );

  const updateNote = useCallback((id: string, noteUpdate: Partial<Note>) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id
          ? { ...note, ...noteUpdate, updatedAt: new Date() }
          : note,
      ),
    );
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
  }, []);

  const getNotesByEntity = useCallback(
    (entityType: string, entityId: string) => {
      return notes.filter(
        (note) => note.entityType === entityType && note.entityId === entityId,
      );
    },
    [notes],
  );

  // Task operations
  const addTask = useCallback(
    (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
      const newTask: Task = {
        ...task,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setTasks((prev) => [...prev, newTask]);
    },
    [],
  );

  const updateTask = useCallback((id: string, taskUpdate: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, ...taskUpdate, updatedAt: new Date() }
          : task,
      ),
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }, []);

  const getTasksByEntity = useCallback(
    (entityType: string, entityId: string) => {
      return tasks.filter(
        (task) => task.entityType === entityType && task.entityId === entityId,
      );
    },
    [tasks],
  );

  // Activity operations
  const addActivity = useCallback(
    (activity: Omit<Activity, "id" | "createdAt">) => {
      const newActivity: Activity = {
        ...activity,
        id: Date.now().toString(),
        createdAt: new Date(),
      };
      setActivities((prev) => [...prev, newActivity]);
    },
    [],
  );

  const getActivitiesByEntity = useCallback(
    (entityType: string, entityId: string) => {
      return activities.filter(
        (activity) =>
          activity.entityType === entityType && activity.entityId === entityId,
      );
    },
    [activities],
  );

  // Call log operations
  const addCallLog = useCallback(
    (callLog: Omit<CallLog, "id" | "createdAt">) => {
      const newCallLog: CallLog = {
        ...callLog,
        id: Date.now().toString(),
        createdAt: new Date(),
      };
      setCallLogs((prev) => [...prev, newCallLog]);
    },
    [],
  );

  const getCallLogsByLead = useCallback(
    (leadId: string) => {
      return callLogs.filter(
        (log) =>
          (log.entityType === "lead" && log.entityId === leadId) ||
          log.leadId === leadId,
      );
    },
    [callLogs],
  );

  const getCallLogsByEntity = useCallback(
    (entityType: string, entityId: string) => {
      return callLogs.filter(
        (log) => log.entityType === entityType && log.entityId === entityId,
      );
    },
    [callLogs],
  );

  // Attachment operations
  const addAttachment = useCallback(
    (attachment: Omit<Attachment, "id" | "uploadedAt">) => {
      const newAttachment: Attachment = {
        ...attachment,
        id: Date.now().toString(),
        uploadedAt: new Date(),
      };
      setAttachments((prev) => [...prev, newAttachment]);
    },
    [],
  );

  const getAttachmentsByLead = useCallback(
    (leadId: string) => {
      return attachments.filter(
        (att) =>
          (att.entityType === "lead" && att.entityId === leadId) ||
          att.leadId === leadId,
      );
    },
    [attachments],
  );

  const getAttachmentsByEntity = useCallback(
    (entityType: string, entityId: string) => {
      return attachments.filter(
        (att) => att.entityType === entityType && att.entityId === entityId,
      );
    },
    [attachments],
  );

  // Dashboard stats
  const getDashboardStats = useCallback(() => {
    const totalLeads = leads.length;
    const totalDeals = deals.length;
    const ongoingDeals = deals.filter(
      (d) => !["won", "lost", "closed"].includes(d.status),
    ).length;
    const wonDeals = deals.filter((d) => d.status === "won").length;
    const lostDeals = deals.filter((d) => d.status === "lost").length;

    const avgTimeToCloseLead = 7; // Replace random value with a fixed or calculated value
    const avgTimeToCloseDeal = 12; // Replace random value with a fixed or calculated value

    const totalDealValue = deals.reduce((sum, d) => sum + d.value, 0);
    const averageDealValue =
      totalDeals > 0 ? Math.floor(totalDealValue / totalDeals) : 0;

    const wonDealsList = deals.filter((d) => d.status === "won");
    const totalWonValue = wonDealsList.reduce((sum, d) => sum + d.value, 0);
    const averageWonDealValue =
      wonDealsList.length > 0
        ? Math.floor(totalWonValue / wonDealsList.length)
        : 0;

    return {
      totalLeads,
      totalDeals,
      ongoingDeals,
      wonDeals,
      lostDeals,
      averageTimeToCloseLead: avgTimeToCloseLead,
      averageTimeToCloseDeal: avgTimeToCloseDeal,
      averageDealValue,
      averageWonDealValue,
    };
  }, [leads, deals]);

  // Sales trend
  const getSalesTrend = useCallback(() => {
    return [
      { month: "Oct", revenue: 45000000, deals: 2 },
      { month: "Nov", revenue: 78000000, deals: 4 },
      { month: "Dec", revenue: 120000000, deals: 6 },
      { month: "Jan", revenue: 95000000, deals: 5 },
      { month: "Feb", revenue: 150000000, deals: 7 },
      { month: "Mar", revenue: 185000000, deals: 8 },
    ];
  }, []);

  return (
    <CRMContext.Provider
      value={{
        leads,
        deals,
        contacts,
        organizations,
        notes,
        tasks,
        activities,
        callLogs,
        attachments,
        addLead,
        updateLead,
        deleteLead,
        getLead,
        addDeal,
        updateDeal,
        deleteDeal,
        getDeal,
        addContact,
        updateContact,
        deleteContact,
        getContact,
        addOrganization,
        updateOrganization,
        deleteOrganization,
        getOrganization,
        addNote,
        updateNote,
        deleteNote,
        getNotesByEntity,
        addTask,
        updateTask,
        deleteTask,
        getTasksByEntity,
        addActivity,
        getActivitiesByEntity,
        addCallLog,
        getCallLogsByLead,
        getCallLogsByEntity,
        addAttachment,
        getAttachmentsByLead,
        getAttachmentsByEntity,
        getDashboardStats,
        getSalesTrend,
      }}
    >
      {children}
    </CRMContext.Provider>
  );
}

export function useCRM() {
  const context = useContext(CRMContext);
  if (context === undefined) {
    throw new Error("useCRM must be used within a CRMProvider");
  }
  return context;
}
