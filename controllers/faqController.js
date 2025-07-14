const Faq = require("../models/Faq");

// Create FAQ
exports.createFaq = async (req, res) => {
  try {
    const { question, answer } = req.body;
    const newFaq = new Faq({ question, answer });
    await newFaq.save();
    res.status(201).json(newFaq);
  } catch (error) {
    res.status(500).json({ message: "Failed to create FAQ", error: error.message });
  }
};

// Get all FAQs
exports.getAllFaqs = async (req, res) => {
  try {
    const faqs = await Faq.find().sort({ createdAt: -1 });
    res.status(200).json(faqs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch FAQs", error: error.message });
  }
};

// Get FAQ by ID
exports.getFaqById = async (req, res) => {
  try {
    const faq = await Faq.findById(req.params.id);
    if (!faq) return res.status(404).json({ message: "FAQ not found" });
    res.status(200).json(faq);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving FAQ", error: error.message });
  }
};

// Update FAQ
exports.updateFaq = async (req, res) => {
  try {
    const { question, answer, listOnWebsite } = req.body;
    const updatedFaq = await Faq.findByIdAndUpdate(
      req.params.id,
      { question, answer, listOnWebsite },
      { new: true }
    );
    if (!updatedFaq) return res.status(404).json({ message: "FAQ not found" });
    res.status(200).json(updatedFaq);
  } catch (error) {
    res.status(500).json({ message: "Failed to update FAQ", error: error.message });
  }
};

// Delete FAQ
exports.deleteFaq = async (req, res) => {
  try {
    const deleted = await Faq.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "FAQ not found" });
    res.status(200).json({ message: "FAQ deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete FAQ", error: error.message });
  }
};
