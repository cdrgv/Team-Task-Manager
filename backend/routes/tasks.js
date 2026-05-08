
const express = require('express');
const { auth } = require('../middleware/auth');
const Task = require('../models/Task');
const User = require('../models/User');

const router = express.Router();


router.get('/', auth, async (req, res) => {
    try {
        const tasks = await Task.find({
            $or: [
                { createdBy: req.user.id },
                { assignedTo: req.user.id }
            ]
        })
        .populate('project', 'name')
        .populate('createdBy', 'name email')
        .populate('assignedTo', 'name email')
        .sort({ dueDate: 1 });

        res.json(tasks);

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
            title,
            description,
            project,
            assignedTo,
            dueDate,
            status
        } = req.body;

      
        if (!title || !project) {
            return res.status(400).json({
                msg: 'Title and project are required'
            });
        }

        
        let assignedUser = null;

        if (assignedTo) {
            assignedUser = await User.findOne({
                email: assignedTo
            });

            if (!assignedUser) {
                return res.status(404).json({
                    msg: 'Assigned user not found'
                });
            }
        }

        const task = new Task({
            title,
            description,
            project,
            assignedTo: assignedUser ? assignedUser._id : null,
            dueDate,
            status,
            createdBy: req.user.id
        });

        await task.save();

    
        await task.populate('project', 'name');
        await task.populate('createdBy', 'name email');
        await task.populate('assignedTo', 'name email');

        res.status(201).json(task);

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
            title,
            description,
            project,
            assignedTo,
            dueDate,
            status
        } = req.body;

        let assignedUser = null;

        if (assignedTo) {
            assignedUser = await User.findOne({
                email: assignedTo
            });

            if (!assignedUser) {
                return res.status(404).json({
                    msg: 'Assigned user not found'
                });
            }
        }

        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            {
                title,
                description,
                project,
                assignedTo: assignedUser ? assignedUser._id : null,
                dueDate,
                status
            },
            {
                new: true,
                runValidators: true
            }
        )
        .populate('project', 'name')
        .populate('createdBy', 'name email')
        .populate('assignedTo', 'name email');

        if (!updatedTask) {
            return res.status(404).json({
                msg: 'Task not found'
            });
        }

        res.json(updatedTask);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            msg: 'Server error'
        });
    }
});


router.delete('/:id', auth, async (req, res) => {

    try {

        const task = await Task.findById(req.params.id);

        if (!task) {

            return res.status(404).json({
                msg: 'Task not found'
            });
        }

        await Task.findByIdAndDelete(req.params.id);

        res.json({
            msg: 'Task deleted successfully'
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            msg: 'Server error'
        });
    }
});

module.exports = router;
