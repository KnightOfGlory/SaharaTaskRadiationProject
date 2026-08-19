package com.example.SaharaTaskRadiationProject.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class HomeController {

    @Value("${server.port}")
    private String port;

    @RequestMapping("/")
    public String index(){
        String viewName = getViewName();
        System.out.println(viewName);
        return viewName;
    }

    private String getViewName(){
        System.out.println("Server port: " + port);
        return "index.html";
    }

}
