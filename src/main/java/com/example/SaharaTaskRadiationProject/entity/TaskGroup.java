package com.example.SaharaTaskRadiationProject.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Data
@Entity
@Table(name = "task_groups")
public class TaskGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
//    private Integer position;

    @OneToMany(mappedBy = "parentGroup")
    private List<Task> tasks;
}
