import * as reportService from '../services/reportService.js';
import { AppError } from '../middlewares/errorMiddleware.js';
import { uploadFileToDrive } from '../utils/googleDrive.js';

export const createReport = async (req, res, next) => {
  try {
    // Parse coordinates as numbers (Prisma expects Floats)
    const reportData = {
      issueType: req.body.issueType,
      description: req.body.description || '',
      address: req.body.address,
      latitude: parseFloat(req.body.latitude),
      longitude: parseFloat(req.body.longitude),
      imageUrl: ''
    };

    // Handle Image Upload to Google Drive (non-blocking)
    if (req.file) {
      try {
        const uploadResult = await uploadFileToDrive(req.file);
        reportData.imageUrl = uploadResult.link;
      } catch (uploadErr) {
        console.error('Google Drive upload failed (report will save without image):', uploadErr.message);
        // Continue without image — report still gets saved
      }
    }

    console.log('Creating report with data:', JSON.stringify(reportData, null, 2));

    const report = await reportService.createReport(reportData, req.user.id);
    res.status(201).json({
      status: 'success',
      data: { report }
    });
  } catch (error) {
    console.error('Report creation failed:', error);
    next(error);
  }
};

export const getAllReports = async (req, res, next) => {
  try {
    // If user is not staff/admin, they can only see their own reports
    // But usually this endpoint is for staff. 
    // We'll handle filtering based on role in the route/middleware if needed.
    const reports = await reportService.getAllReports();
    res.status(200).json({
      status: 'success',
      results: reports.length,
      data: { reports }
    });
  } catch (error) {
    next(error);
  }
};

export const getMyReports = async (req, res, next) => {
  try {
    const reports = await reportService.getUserReports(req.user.id);
    res.status(200).json({
      status: 'success',
      results: reports.length,
      data: { reports }
    });
  } catch (error) {
    next(error);
  }
};

export const getReport = async (req, res, next) => {
  try {
    const report = await reportService.getReportById(req.params.id);
    if (!report) {
      return next(new AppError('No report found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: { report }
    });
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const report = await reportService.updateReportStatus(req.params.id, req.body.status);
    res.status(200).json({
      status: 'success',
      data: { report }
    });
  } catch (error) {
    next(error);
  }
};

export const assignStaff = async (req, res, next) => {
  try {
    const report = await reportService.assignStaffToReport(req.params.id, req.body.staffId);
    res.status(200).json({
      status: 'success',
      data: { report }
    });
  } catch (error) {
    next(error);
  }
};
