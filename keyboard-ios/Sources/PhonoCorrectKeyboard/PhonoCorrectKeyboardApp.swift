import SwiftUI
import UIKit

@main
struct PhonoCorrectKeyboardApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}

struct ContentView: View {
    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "brain")
                .font(.system(size: 60))
                .foregroundColor(.blue)
            
            Text("PhonoCorrect AI Keyboard")
                .font(.title)
                .fontWeight(.bold)
            
            Text("Custom keyboard extension for phonetic spelling corrections")
                .font(.body)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
            
            VStack(alignment: .leading, spacing: 12) {
                Text("Setup Instructions:")
                    .font(.headline)
                
                Text("1. Go to Settings > General > Keyboard")
                Text("2. Tap 'Keyboards' > 'Add New Keyboard'")
                Text("3. Select 'PhonoCorrect AI'")
                Text("4. Enable 'Allow Full Access' for suggestions")
            }
            .padding()
            .background(Color(.systemGray6))
            .cornerRadius(12)
            
            Button("Open Settings") {
                if let settingsUrl = URL(string: UIApplication.openSettingsURLString) {
                    UIApplication.shared.open(settingsUrl)
                }
            }
            .buttonStyle(.borderedProminent)
            
            Spacer()
        }
        .padding()
    }
}

#Preview {
    ContentView()
}