package com.example.SaharaTaskRadiationProject.controller;

import com.example.SaharaTaskRadiationProject.entity.Task;
import com.example.SaharaTaskRadiationProject.entity.TaskGroup;
import com.example.SaharaTaskRadiationProject.repository.TaskGroupRepository;
import com.example.SaharaTaskRadiationProject.repository.TaskRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;



@RestController
@RequestMapping("/api")
public class ApiController {

    private final TaskGroupRepository taskGroupRepository;
    private final TaskRepository taskRepository;

    public ApiController(TaskGroupRepository taskGroupRepository, TaskRepository taskRepository) {
        this.taskGroupRepository = taskGroupRepository;
        this.taskRepository = taskRepository;

    }

    @GetMapping("/task-groups")
    public List<TaskGroup> getTaskGroups() {
        return taskGroupRepository.findAll();
    }


    @PatchMapping("/tasks/{id}")
    public ResponseEntity<?> patchTaskStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {

        try {
            Task task = taskRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Task not found"));

            String status = body.get("status");

            if (!(status.equals("TODO") || status.equals("DONE")))
                return ResponseEntity
                        .badRequest()
                        .body("Patch failed: " + "bad status value");

            task.setStatus(status);
            taskRepository.save(task);

            return ResponseEntity.ok("Patched successfully");

        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body("Patch failed: " + e.getMessage());
        }
    }

}

