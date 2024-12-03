package com.example.research
import android.os.Bundle
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class MainActivity : AppCompatActivity() {

    private lateinit var moodInput: EditText
    private lateinit var stageInput: EditText
    private lateinit var ageInput: EditText
    private lateinit var genderInput: EditText
    private lateinit var resultText: TextView
    private lateinit var getRecommendationsBtn: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        moodInput = findViewById(R.id.moodInput)
        stageInput = findViewById(R.id.stageInput)
        ageInput = findViewById(R.id.ageInput)
        genderInput = findViewById(R.id.genderInput)
        resultText = findViewById(R.id.resultText)
        getRecommendationsBtn = findViewById(R.id.getRecommendationsBtn)

        getRecommendationsBtn.setOnClickListener {
            val mood = moodInput.text.toString()
            val stage = stageInput.text.toString()
            val age = ageInput.text.toString().toIntOrNull() ?: 0
            val gender = genderInput.text.toString()

            if (mood.isBlank() || stage.isBlank() || age == 0 || gender.isBlank()) {
                Toast.makeText(this, "Please fill all fields", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val userInput = UserInput(mood, stage, age, gender)
            getRecommendations(userInput)
        }
    }

    private fun getRecommendations(userInput: UserInput) {
        val retrofit = Retrofit.Builder()
            .baseUrl("http://192.168.1.3:8000")
            .addConverterFactory(GsonConverterFactory.create())
            .build()

        val apiService = retrofit.create(ApiService::class.java)
        apiService.getRecommendations(userInput).enqueue(object : Callback<Recommendation> {
            override fun onResponse(call: Call<Recommendation>, response: Response<Recommendation>) {
                if (response.isSuccessful) {
                    val recommendation = response.body()
                    val activities = recommendation?.activities?.joinToString("\n") ?: "No activities found."
                    val suggestions = recommendation?.suggestions?.joinToString("\n") ?: "No suggestions found."
                    resultText.text = "Activities:\n$activities\n\nSuggestions:\n$suggestions"
                } else {
                    resultText.text = "Error: ${response.message()}"
                }
            }

            override fun onFailure(call: Call<Recommendation>, t: Throwable) {
                resultText.text = "Failed to connect to the server."
            }
        })
    }
}
