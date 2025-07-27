import UIKit
import SwiftUI

class KeyboardViewController: UIInputViewController {
    
    @IBOutlet var nextKeyboardButton: UIButton!
    
    override func updateViewConstraints() {
        super.updateViewConstraints()
        
        // Add custom view sizing constraints here
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // Create the custom keyboard view
        setupKeyboardView()
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
    }
    
    override func textWillChange(_ textInput: UITextInput?) {
        // The app is about to change the document's contents
    }
    
    override func textDidChange(_ textInput: UITextInput?) {
        // The app has just changed the document's contents
        analyzeCurrentText()
    }
    
    private func setupKeyboardView() {
        // Create the main keyboard container
        let keyboardView = KeyboardView(controller: self)
        let hostingController = UIHostingController(rootView: keyboardView)
        
        addChild(hostingController)
        view.addSubview(hostingController.view)
        hostingController.didMove(toParent: self)
        
        // Setup constraints
        hostingController.view.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            hostingController.view.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            hostingController.view.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            hostingController.view.topAnchor.constraint(equalTo: view.topAnchor),
            hostingController.view.bottomAnchor.constraint(equalTo: view.bottomAnchor)
        ])
    }
    
    private func analyzeCurrentText() {
        guard let textProxy = textDocumentProxy else { return }
        
        // Get current text context
        let beforeText = textProxy.documentContextBeforeInput ?? ""
        let afterText = textProxy.documentContextAfterInput ?? ""
        let fullText = beforeText + afterText
        
        // TODO: Implement phonetic analysis
        // This would call the shared PhonoCorrect engine
        print("Analyzing text: \(fullText)")
    }
    
    // MARK: - Public Methods for KeyboardView
    
    func insertText(_ text: String) {
        textDocumentProxy.insertText(text)
    }
    
    func deleteBackward() {
        textDocumentProxy.deleteBackward()
    }
    
    func advanceToNextInputMode() {
        advanceToNextInputMode()
    }
    
    func applySuggestion(_ suggestion: String, replacing range: NSRange) {
        // Apply phonetic suggestion
        for _ in 0..<range.length {
            textDocumentProxy.deleteBackward()
        }
        textDocumentProxy.insertText(suggestion)
    }
}

struct KeyboardView: View {
    let controller: KeyboardViewController
    @State private var suggestions: [String] = []
    @State private var currentText: String = ""
    
    var body: some View {
        VStack(spacing: 0) {
            // Suggestions bar
            if !suggestions.isEmpty {
                SuggestionsBar(suggestions: suggestions) { suggestion in
                    // Apply suggestion
                    controller.applySuggestion(suggestion, replacing: NSRange(location: 0, length: 1))
                }
                .frame(height: 40)
                .background(Color(.systemGray6))
            }
            
            // Main keyboard area
            VStack(spacing: 8) {
                // Top row
                HStack(spacing: 4) {
                    ForEach(["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"], id: \.self) { key in
                        KeyButton(key: key) {
                            controller.insertText(key.lowercased())
                        }
                    }
                }
                
                // Middle row
                HStack(spacing: 4) {
                    Spacer(minLength: 20)
                    ForEach(["A", "S", "D", "F", "G", "H", "J", "K", "L"], id: \.self) { key in
                        KeyButton(key: key) {
                            controller.insertText(key.lowercased())
                        }
                    }
                    Spacer(minLength: 20)
                }
                
                // Bottom row
                HStack(spacing: 4) {
                    Button("⇧") {
                        // TODO: Handle shift
                    }
                    .frame(width: 40, height: 40)
                    .background(Color(.systemGray4))
                    .cornerRadius(6)
                    
                    ForEach(["Z", "X", "C", "V", "B", "N", "M"], id: \.self) { key in
                        KeyButton(key: key) {
                            controller.insertText(key.lowercased())
                        }
                    }
                    
                    Button("⌫") {
                        controller.deleteBackward()
                    }
                    .frame(width: 40, height: 40)
                    .background(Color(.systemGray4))
                    .cornerRadius(6)
                }
                
                // Space bar row
                HStack(spacing: 4) {
                    Button("123") {
                        // TODO: Switch to numbers
                    }
                    .frame(width: 50, height: 40)
                    .background(Color(.systemGray4))
                    .cornerRadius(6)
                    
                    Button("🌐") {
                        controller.advanceToNextInputMode()
                    }
                    .frame(width: 40, height: 40)
                    .background(Color(.systemGray4))
                    .cornerRadius(6)
                    
                    Button("space") {
                        controller.insertText(" ")
                    }
                    .frame(maxWidth: .infinity, minHeight: 40)
                    .background(Color(.systemGray5))
                    .cornerRadius(6)
                    
                    Button("return") {
                        controller.insertText("\n")
                    }
                    .frame(width: 60, height: 40)
                    .background(Color(.systemBlue))
                    .foregroundColor(.white)
                    .cornerRadius(6)
                }
            }
            .padding(8)
            .background(Color(.systemGray5))
        }
    }
}

struct KeyButton: View {
    let key: String
    let action: () -> Void
    
    var body: some View {
        Button(key) {
            action()
        }
        .frame(width: 30, height: 40)
        .background(Color.white)
        .foregroundColor(.black)
        .cornerRadius(6)
        .shadow(color: .black.opacity(0.1), radius: 1, x: 0, y: 1)
    }
}

struct SuggestionsBar: View {
    let suggestions: [String]
    let onSuggestionTap: (String) -> Void
    
    var body: some View {
        HStack {
            Text("Suggestions:")
                .font(.caption)
                .foregroundColor(.secondary)
            
            ForEach(suggestions, id: \.self) { suggestion in
                Button(suggestion) {
                    onSuggestionTap(suggestion)
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(Color(.systemBlue))
                .foregroundColor(.white)
                .cornerRadius(16)
                .font(.caption)
            }
            
            Spacer()
        }
        .padding(.horizontal)
    }
}