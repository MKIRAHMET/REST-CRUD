import React, { useEffect, useState } from "react";
import { getTasks, createTask, updateTask, deleteTask } from "../api";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Fetch tasks from backend on mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await getTasks(); // backend tasks
      const backendTasks = response.data;

      const saved = localStorage.getItem("tasks"); // temp order
      if (saved) {
        const localTasks = JSON.parse(saved);
        // Reorder backendTasks according to localTasks ids
        const orderedTasks = localTasks
          .map(local => backendTasks.find(b => b.id === local.id) || local)
          .filter(Boolean);
        setTasks(orderedTasks);
      } else {
        setTasks(backendTasks);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const addTask = async () => {
    if (!title) return;
    try {
      const res = await createTask({ title, description, completed: false, order: tasks.length });
      const newTasks = [...tasks, res.data];
      setTasks(newTasks);
      localStorage.setItem("tasks", JSON.stringify(newTasks));
      setTitle("");
      setDescription("");
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const editTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, isEditing: true } : t));
  };

  const handleChange = (id, field, value) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const saveTask = async (id) => {
    const taskToSave = tasks.find(t => t.id === id);
    if (!taskToSave) return;
    try {
      const res = await updateTask(id, {
        title: taskToSave.title,
        description: taskToSave.description,
        completed: taskToSave.completed || false,
        order: taskToSave.order || 0
      });

      const updatedTasks = tasks.map(t => t.id === id ? { ...res.data, isEditing: false } : t);
      setTasks(updatedTasks);
      localStorage.setItem("tasks", JSON.stringify(updatedTasks));
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const removeTask = async (id) => {
    try {
      await deleteTask(id);
      const updatedTasks = tasks.filter(t => t.id !== id);
      setTasks(updatedTasks);
      localStorage.setItem("tasks", JSON.stringify(updatedTasks));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // Drag & Drop
  const handleOnDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setTasks(items);
    localStorage.setItem("tasks", JSON.stringify(items)); // temporary save
  };

  // Save order to backend
  const saveOrder = async () => {
    try {
      await Promise.all(
        tasks.map((task, i) =>
          updateTask(task.id, { ...task, order: i })
        )
      );
      localStorage.removeItem("tasks"); // clear temp storage
      alert("Order saved!");
    } catch (error) {
      console.error("Error saving order:", error);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "30px auto" }}>
      <h1>Tasks</h1>

      <input
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        style={{ marginRight: "5px" }}
      />
      <input
        placeholder="Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
        style={{ marginRight: "5px" }}
      />
      <button onClick={addTask}>Add Task</button>
      <button onClick={saveOrder} style={{ marginLeft: "10px" }}>Save Order</button>

      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="tasks">
          {(provided) => (
            <ul {...provided.droppableProps} ref={provided.innerRef} style={{ listStyle: "none", padding: 0, marginTop: "20px" }}>
              {tasks.map((task, index) => (
                <Draggable
                  key={task.id}
                  draggableId={task.id.toString()}
                  index={index}
                  isDragDisabled={task.isEditing} // prevent drag while editing
                >
                  {(provided) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        padding: "8px",
                        margin: "4px 0",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        backgroundColor: "#f9f9f9",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        ...provided.draggableProps.style
                      }}
                    >
                      {task.isEditing ? (
                        <>
                          <input
                            value={task.title}
                            onChange={e => handleChange(task.id, "title", e.target.value)}
                            style={{ marginRight: "5px" }}
                          />
                          <input
                            value={task.description}
                            onChange={e => handleChange(task.id, "description", e.target.value)}
                            style={{ marginRight: "5px" }}
                          />
                          <button onClick={() => saveTask(task.id)}>Save</button>
                        </>
                      ) : (
                        <>
                          <span>{task.title}: {task.description}</span>
                          <div>
                            <button onClick={() => editTask(task.id)}>Edit</button>
                            <button onClick={() => removeTask(task.id)} style={{ marginLeft: "5px" }}>Delete</button>
                          </div>
                        </>
                      )}
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default TaskList;
