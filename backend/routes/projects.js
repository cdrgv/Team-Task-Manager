const express = require('express');
const { auth } = require('../middleware/auth');
const Project = require('../models/Project');
const User = require('../models/User');

const router = express.Router();

router.get('/', auth, async (req, res) => {
    try {

        const projects = await Project.find({
            $or: [
                { createdBy: req.user.id },
                { team: req.user.id }
            ]
        }).populate('createdBy team', 'name email');

        res.json(projects);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            msg: 'Server error'
        });
    }
});

router.post('/', auth, async (req, res) => {

    try {

        const {
            name,
            description,
            team
        } = req.body;

        const teamMembers = await User.find({
            email: {
                $in: team
            }
        });

        const teamIds = teamMembers.map(member => member._id);

        const project = new Project({
            name,
            description,
            team: teamIds,
            createdBy: req.user.id
        });

        await project.save();

        await project.populate('createdBy team', 'name email');

        res.status(201).json(project);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            msg: 'Server error'
        });
    }
});

router.put('/:id', auth, async (req, res) => {

    try {

        const {
            name,
            description,
            team
        } = req.body;

        const teamMembers = await User.find({
            email: {
                $in: team
            }
        });

        const teamIds = teamMembers.map(member => member._id);

        const updatedProject = await Project.findByIdAndUpdate(
            req.params.id,
            {
                name,
                description,
                team: teamIds
            },
            {
                new: true,
                runValidators: true
            }
        ).populate('createdBy team', 'name email');

        if (!updatedProject) {

            return res.status(404).json({
                msg: 'Project not found'
            });
        }

        res.json(updatedProject);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            msg: 'Server error'
        });
    }
});

router.delete('/:id', auth, async (req, res) => {

    try {

        const project = await Project.findById(req.params.id);

        if (!project) {

            return res.status(404).json({
                msg: 'Project not found'
            });
        }

        // Only creator can delete
        if (project.createdBy.toString() !== req.user.id) {

            return res.status(403).json({
                msg: 'Not authorized'
            });
        }

        await Project.findByIdAndDelete(req.params.id);

        res.json({
            msg: 'Project deleted successfully'
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            msg: 'Server error'
        });
    }
});
module.exports = router;