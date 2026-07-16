// server/controllers/faqController.js - FAQ CRUD operations
const FAQ = require('../models/FAQ');

// @desc    Get all active FAQs (public – for customers)
// @route   GET /api/faqs
// @access  Public
const getFAQs = async (req, res, next) => {
  try {
    const faqs = await FAQ.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .select('question answer order');
    res.status(200).json({
      success: true,
      data: faqs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all FAQs (admin – includes inactive)
// @route   GET /api/faqs/all
// @access  Private (Owner)
const getAllFAQs = async (req, res, next) => {
  try {
    const faqs = await FAQ.find().sort({ order: 1, createdAt: -1 });
    res.status(200).json({
      success: true,
      data: faqs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new FAQ
// @route   POST /api/faqs
// @access  Private (Owner)
const createFAQ = async (req, res, next) => {
  try {
    const { question, answer, order } = req.body;

    if (!question || !answer) {
      res.status(400);
      throw new Error('Question and answer are required');
    }

    // Get highest order if not provided
    let orderValue = order;
    if (orderValue === undefined || orderValue === null) {
      const lastFAQ = await FAQ.findOne().sort({ order: -1 });
      orderValue = lastFAQ ? lastFAQ.order + 1 : 0;
    }

    const faq = await FAQ.create({
      question: question.trim(),
      answer: answer.trim(),
      order: orderValue,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      data: faq,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an FAQ
// @route   PUT /api/faqs/:id
// @access  Private (Owner)
const updateFAQ = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { question, answer, order, isActive } = req.body;

    const faq = await FAQ.findById(id);
    if (!faq) {
      res.status(404);
      throw new Error('FAQ not found');
    }

    if (question !== undefined) faq.question = question.trim();
    if (answer !== undefined) faq.answer = answer.trim();
    if (order !== undefined) faq.order = order;
    if (isActive !== undefined) faq.isActive = isActive;

    await faq.save();

    res.status(200).json({
      success: true,
      data: faq,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an FAQ
// @route   DELETE /api/faqs/:id
// @access  Private (Owner)
const deleteFAQ = async (req, res, next) => {
  try {
    const { id } = req.params;

    const faq = await FAQ.findById(id);
    if (!faq) {
      res.status(404);
      throw new Error('FAQ not found');
    }

    await faq.deleteOne();

    res.status(200).json({
      success: true,
      message: 'FAQ deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFAQs,
  getAllFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
};