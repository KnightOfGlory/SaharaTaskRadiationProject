package com.example.SaharaTaskRadiationProject.repository;

import com.example.SaharaTaskRadiationProject.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository
        extends JpaRepository<Task, Long> {
}
