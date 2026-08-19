package com.example.SaharaTaskRadiationProject.controller;

import com.example.SaharaTaskRadiationProject.entity.TaskGroup;
import com.example.SaharaTaskRadiationProject.repository.TaskGroupRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ApiController {

    private final TaskGroupRepository taskGroupRepository;

    public ApiController(TaskGroupRepository taskGroupRepository) {
        this.taskGroupRepository = taskGroupRepository;
    }

    @GetMapping("/task-groups")
    public List<TaskGroup> getTaskGroups() {

        return taskGroupRepository.findAll();
    }
}

