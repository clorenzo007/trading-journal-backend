import Setup from "../models/Setup.js";
import cloudinary from "../config/cloudinary.js";

// ================= GET ALL SETUPS (USER SCOPED) =================
export const getSetups = async (req, res) => {
  try {
    const setups = await Setup.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(setups);
  } catch (err) {
    console.error("GET SETUPS ERROR:", err);
    res.status(500).json({ error: "Failed to fetch setups" });
  }
};

// ================= CREATE SETUP =================
export const createSetup = async (req, res) => {
  try {
    const setup = await Setup.create({
      ...req.body,
      user: req.user._id,
    });
    res.status(201).json(setup);
  } catch (err) {
    console.error("CREATE SETUP ERROR:", err);
    res.status(400).json({ error: err.message });
  }
};

// ================= UPDATE SETUP =================
export const updateSetup = async (req, res) => {
  try {
    const setup = await Setup.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!setup) return res.status(404).json({ error: "Setup not found" });
    res.json(setup);
  } catch (err) {
    console.error("UPDATE SETUP ERROR:", err);
    res.status(400).json({ error: err.message });
  }
};

// ================= DELETE SETUP =================
export const deleteSetup = async (req, res) => {
  try {
    const setup = await Setup.findOne({ _id: req.params.id, user: req.user._id });
    if (!setup) return res.status(404).json({ error: "Setup not found" });

    // Delete images from Cloudinary if they exist
    if (setup.theoryImage?.public_id) {
      await cloudinary.uploader.destroy(setup.theoryImage.public_id);
    }
    if (setup.exampleImage?.public_id) {
      await cloudinary.uploader.destroy(setup.exampleImage.public_id);
    }

    await Setup.deleteOne({ _id: setup._id });
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE SETUP ERROR:", err);
    res.status(500).json({ error: "Failed to delete setup" });
  }
};

// ================= UPLOAD SETUP IMAGE =================
export const uploadSetupImage = async (req, res) => {
  const { field } = req.params; // 'theory' or 'example'
  if (!["theory", "example"].includes(field)) {
    return res.status(400).json({ error: "Invalid field" });
  }

  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const result = await cloudinary.uploader.upload_stream(
      { folder: `trading-journal/setups/${field}` },
      async (error, uploaded) => {
        if (error) return res.status(500).json({ error: "Cloudinary error" });

        const setup = await Setup.findOne({ _id: req.params.id, user: req.user._id });
        if (!setup) return res.status(404).json({ error: "Setup not found" });

        const imageField = field === "theory" ? "theoryImage" : "exampleImage";

        // Delete old image if it exists
        if (setup[imageField]?.public_id) {
          try {
            await cloudinary.uploader.destroy(setup[imageField].public_id);
          } catch (err) {
            console.error("OLD SETUP IMAGE DELETE ERROR:", err);
          }
        }

        setup[imageField] = {
          url: uploaded.secure_url,
          public_id: uploaded.public_id,
        };

        await setup.save();
        res.json(setup);
      },
    );

    result.end(req.file.buffer);
  } catch (err) {
    console.error("SETUP IMAGE UPLOAD ERROR:", err);
    res.status(500).json({ error: "Upload failed" });
  }
};
