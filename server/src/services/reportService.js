import prisma from '../config/prisma.js';

export const createReport = async (reportData, userId) => {
  return await prisma.report.create({
    data: {
      ...reportData,
      reportedById: userId,
      status: 'PENDING'
    },
    include: {
      reportedBy: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });
};

export const getAllReports = async (filters = {}) => {
  return await prisma.report.findMany({
    where: filters,
    include: {
      reportedBy: {
        select: { id: true, name: true }
      },
      assignedTo: {
        select: { id: true, name: true }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

export const getReportById = async (id) => {
  return await prisma.report.findUnique({
    where: { id },
    include: {
      reportedBy: {
        select: { id: true, name: true, email: true }
      },
      assignedTo: {
        select: { id: true, name: true, email: true }
      }
    }
  });
};

export const updateReportStatus = async (id, status) => {
  return await prisma.report.update({
    where: { id },
    data: { status }
  });
};

export const assignStaffToReport = async (id, staffId) => {
  return await prisma.report.update({
    where: { id },
    data: { assignedToId: staffId }
  });
};

export const getUserReports = async (userId) => {
  return await prisma.report.findMany({
    where: { reportedById: userId },
    orderBy: { createdAt: 'desc' }
  });
};
