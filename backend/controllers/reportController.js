const Report = require("../models/Report");

const createReport = async (req, res) => {
  try {
    const { propertyId, reason, description } = req.body;

    const report = await Report.create({
      property: propertyId,
      reportedBy: req.user._id,
      reason,
      description: description || "",
    });

    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("property", "title")
      .populate("reportedBy", "name email");

    res.json(reports);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const resolveReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    report.status = "resolved";

    await report.save();

    res.json({
      message: "Report resolved",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createReport,
  getReports,
  resolveReport,
};