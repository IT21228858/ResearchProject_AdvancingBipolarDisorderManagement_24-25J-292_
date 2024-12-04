# ResearchProject_AdvancingBipolarDisorderManagement_24-25J-292_
# Passive data analysis for Mood Prediction and Social Isolation Detection 

# Description

This project aims to develop a system capable of predicting mood changes and identifying social isolation through the analysis of passive data sources such as text inputs, audio patterns, and browser history.

# Components developed

Text Detection Model: A machine learning model developed in Python
Audio Detection Model: A machine learning model designed to detect mood-related patterns from audio inputs.
Browser History Data Retrieval: A Flask-based service to capture and process text and audio from browsing activity.

# Technologies used 

Python (for model development)
Flask (for browser data retrieval and API integration)
JavaScript and React JS
Machine Learning Libraries (Scikit-learn)

# System architecture diagram

+------------------+          +----------------+          +----------------+
|  Browser History |          |  User Text     |          |   Audio Input  |
|  (Flask API)     |          |  Input         |          |                |
+------------------+          +----------------+          +----------------+
         |                           |                          |
         v                           v                          v
+--------------------------------------------------------------+
|                      Flask Backend                           |
+--------------------------------------------------------------+
         |                           |                          |
         v                           v                          v
+-------------------+       +--------------------+       +--------------------+
| Text Detection    |       | Audio Detection    |       |  Prediction &       |
| Model             |       | Model              |       |  Insights           |
+-------------------+       +--------------------+       +--------------------+
                                       |
                                       v
                            +-----------------------+
                            | Intervention Module   |
                            | (Personalized Actions)|
                            +-----------------------+
