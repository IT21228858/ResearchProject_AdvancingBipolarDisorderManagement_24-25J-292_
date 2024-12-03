package com.example.research

import retrofit2.Call
import retrofit2.http.Body
import retrofit2.http.POST

data class UserInput(
    val mood: String,
    val bipolar_stage: String,
    val age: Int,
    val gender: String
)

data class Recommendation(
    val activities: List<String>,
    val suggestions: List<String>,
    val similarity_scores: List<Float>
)

interface ApiService {
    @POST("/recommendations/")
    fun getRecommendations(@Body userInput: UserInput): Call<Recommendation>
}
