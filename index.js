const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const Task = require("./task")
const app = express()
const port = process.env.PORT || 5000
require("dotenv").config()

// using cors
app.use(cors())

// parse data
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//database connection
async function bootstrap() {
  try {
    await mongoose.connect(
      `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.d0hszsm.mongodb.net/mcs?retryWrites=true&w=majority`
    )
    console.log(`🛢 Database connection successful`)

    app.get("/", (req, res) => {
      res.send("app running")
    })

    app.get("/tasks/:uid", (req, res) => {
      const uid = req.params.uid

      Task.find({ uid })
        .then((tasks) => {
          res.status(200).json(tasks)
        })
        .catch((error) => {
          res.status(500).json({ error: "Error retrieving tasks" })
        })
    })

    app.post("/add-task", (req, res) => {
      const { title, description, uid } = req.body

      const newTask = new Task({
        title,
        description,
        uid,
      })

      newTask
        .save()
        .then((task) => {
          res.status(201).json(task)
        })
        .catch((error) => {
          res.status(500).json({ error })
        })
    })
    app.patch("/update-task/:id", (req, res) => {
      const taskId = req.params.id
      const { title, description, status } = req.body

      Task.findByIdAndUpdate(
        taskId,
        { title, description, status },
        { new: true }
      )
        .then((updatedTask) => {
          if (!updatedTask) {
            return res.status(404).json({ error: "Task not found" })
          }
          res.json(updatedTask)
        })
        .catch((error) => {
          res.status(500).json({ error })
        })
    })

    app.delete("/delete-task/:taskId", (req, res) => {
      const taskId = req.params.taskId
      console.log(taskId)
      Task.findByIdAndRemove(taskId)
        .then((deletedTask) => {
          if (!deletedTask) {
            return res.status(404).json({ error: "Task not found" })
          }
          res
            .status(200)
            .json({ deletedCount: 1, message: "Task deleted successfully" })
        })
        .catch((error) => {
          console.log(error)
          res.status(500).json({ error: "Error deleting the task" })
        })
    })

    app.listen(port, () => {
      console.log(`Server is  listening on port ${port}`)
    })
  } catch (err) {
    console.log(`Failed to connect database`, err)
  }
}

bootstrap()
