package com.example.SaharaTaskRadiationProject.repository;

import com.example.SaharaTaskRadiationProject.entity.TaskGroup;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskGroupRepository
        extends JpaRepository<TaskGroup, Long> {
}
