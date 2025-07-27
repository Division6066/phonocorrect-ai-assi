package com.phonocorrect.ai.keyboard

import android.inputmethodservice.InputMethodService
import android.inputmethodservice.Keyboard
import android.inputmethodservice.KeyboardView
import android.view.KeyEvent
import android.view.View
import android.view.inputmethod.EditorInfo
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.ComposeView
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

class PhonoCorrectInputMethodService : InputMethodService(), KeyboardView.OnKeyboardActionListener {
    
    private var keyboardView: KeyboardView? = null
    private var keyboard: Keyboard? = null
    private var suggestionsView: ComposeView? = null
    
    private var suggestions = mutableStateOf(emptyList<PhoneticSuggestion>())
    private var currentText = mutableStateOf("")
    
    data class PhoneticSuggestion(
        val original: String,
        val suggestion: String,
        val confidence: Float
    )
    
    override fun onCreateInputView(): View {
        val container = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
        }
        
        // Create suggestions view
        suggestionsView = ComposeView(this).apply {
            setContent {
                PhonoCorrectTheme {
                    SuggestionsBar(
                        suggestions = suggestions.value,
                        onSuggestionClick = ::applySuggestion
                    )
                }
            }
        }
        
        // Create keyboard view
        keyboard = Keyboard(this, R.xml.qwerty)
        keyboardView = KeyboardView(this, null).apply {
            keyboard = this@PhonoCorrectInputMethodService.keyboard
            setOnKeyboardActionListener(this@PhonoCorrectInputMethodService)
        }
        
        container.addView(suggestionsView)
        container.addView(keyboardView)
        
        return container
    }
    
    override fun onStartInput(attribute: EditorInfo?, restarting: Boolean) {
        super.onStartInput(attribute, restarting)
        // Initialize for new input session
        currentText.value = ""
        suggestions.value = emptyList()
    }
    
    override fun onFinishInput() {
        super.onFinishInput()
        // Clean up when input session ends
        currentText.value = ""
        suggestions.value = emptyList()
    }
    
    // KeyboardView.OnKeyboardActionListener implementation
    override fun onKey(primaryCode: Int, keyCodes: IntArray?) {
        when (primaryCode) {
            Keyboard.KEYCODE_DELETE -> {
                handleBackspace()
            }
            Keyboard.KEYCODE_SHIFT -> {
                handleShift()
            }
            Keyboard.KEYCODE_DONE -> {
                handleEnter()
            }
            32 -> { // Space
                commitText(" ")
                analyzeCurrentText()
            }
            else -> {
                if (primaryCode > 0) {
                    val char = primaryCode.toChar()
                    if (char.isLetter()) {
                        commitText(char.toString().lowercase())
                        updateCurrentText(char.toString())
                    }
                }
            }
        }
    }
    
    override fun onPress(primaryCode: Int) {
        // Provide haptic feedback if needed
    }
    
    override fun onRelease(primaryCode: Int) {
        // Handle key release
    }
    
    override fun onText(text: CharSequence?) {
        text?.let { commitText(it.toString()) }
    }
    
    override fun swipeDown() {}
    override fun swipeLeft() {}
    override fun swipeRight() {}
    override fun swipeUp() {}
    
    private fun commitText(text: String) {
        currentInputConnection?.commitText(text, 1)
    }
    
    private fun handleBackspace() {
        currentInputConnection?.deleteSurroundingText(1, 0)
        // Update current text tracking
        if (currentText.value.isNotEmpty()) {
            currentText.value = currentText.value.dropLast(1)
        }
    }
    
    private fun handleShift() {
        // TODO: Implement shift functionality
    }
    
    private fun handleEnter() {
        currentInputConnection?.sendKeyEvent(
            KeyEvent(KeyEvent.ACTION_DOWN, KeyEvent.KEYCODE_ENTER)
        )
        currentInputConnection?.sendKeyEvent(
            KeyEvent(KeyEvent.ACTION_UP, KeyEvent.KEYCODE_ENTER)
        )
    }
    
    private fun updateCurrentText(newChar: String) {
        currentText.value += newChar
        // Analyze after a delay to avoid too frequent analysis
        analyzeCurrentText()
    }
    
    private fun analyzeCurrentText() {
        // TODO: Implement phonetic analysis using shared logic
        // For now, create mock suggestions
        val words = currentText.value.split(" ")
        val lastWord = words.lastOrNull() ?: ""
        
        if (lastWord.length > 2) {
            val mockSuggestions = generateMockSuggestions(lastWord)
            suggestions.value = mockSuggestions
        } else {
            suggestions.value = emptyList()
        }
    }
    
    private fun generateMockSuggestions(word: String): List<PhoneticSuggestion> {
        // Mock phonetic suggestions
        return when (word.lowercase()) {
            "fone" -> listOf(PhoneticSuggestion("fone", "phone", 0.9f))
            "seperate" -> listOf(PhoneticSuggestion("seperate", "separate", 0.95f))
            "recieve" -> listOf(PhoneticSuggestion("recieve", "receive", 0.9f))
            "definately" -> listOf(PhoneticSuggestion("definately", "definitely", 0.85f))
            else -> emptyList()
        }
    }
    
    private fun applySuggestion(suggestion: PhoneticSuggestion) {
        // Replace the current word with the suggestion
        val words = currentText.value.split(" ").toMutableList()
        if (words.isNotEmpty()) {
            words[words.lastIndex] = suggestion.suggestion
            
            // Delete the current word and insert the suggestion
            currentInputConnection?.deleteSurroundingText(suggestion.original.length, 0)
            currentInputConnection?.commitText(suggestion.suggestion, 1)
            
            // Update current text
            currentText.value = words.joinToString(" ")
            
            // Clear suggestions after applying
            suggestions.value = emptyList()
        }
    }
}

@Composable
fun SuggestionsBar(
    suggestions: List<PhonoCorrectInputMethodService.PhoneticSuggestion>,
    onSuggestionClick: (PhonoCorrectInputMethodService.PhoneticSuggestion) -> Unit
) {
    if (suggestions.isNotEmpty()) {
        LazyRow(
            modifier = Modifier
                .fillMaxWidth()
                .background(MaterialTheme.colorScheme.surface)
                .padding(horizontal = 8.dp, vertical = 4.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            item {
                Text(
                    text = "Suggestions:",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.align(Alignment.CenterVertically)
                )
            }
            
            items(suggestions) { suggestion ->
                SuggestionChip(
                    suggestion = suggestion,
                    onClick = { onSuggestionClick(suggestion) }
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SuggestionChip(
    suggestion: PhonoCorrectInputMethodService.PhoneticSuggestion,
    onClick: () -> Unit
) {
    AssistChip(
        onClick = onClick,
        label = {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Text(
                    text = "\"${suggestion.original}\"",
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Text(
                    text = "→",
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Text(
                    text = "\"${suggestion.suggestion}\"",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium
                )
            }
        },
        colors = AssistChipDefaults.assistChipColors(
            containerColor = MaterialTheme.colorScheme.primaryContainer,
            labelColor = MaterialTheme.colorScheme.onPrimaryContainer
        )
    )
}

@Composable
fun PhonoCorrectTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = lightColorScheme(
            primary = Color(0xFF1976D2),
            onPrimary = Color.White,
            primaryContainer = Color(0xFFE3F2FD),
            onPrimaryContainer = Color(0xFF0D47A1),
            surface = Color(0xFFF5F5F5),
            onSurface = Color(0xFF212121),
            onSurfaceVariant = Color(0xFF757575)
        ),
        content = content
    )
}