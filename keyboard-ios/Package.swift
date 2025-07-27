// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "PhonoCorrectKeyboard",
    platforms: [
        .iOS(.v15)
    ],
    products: [
        .library(
            name: "PhonoCorrectKeyboard",
            targets: ["PhonoCorrectKeyboard"]
        ),
    ],
    dependencies: [],
    targets: [
        .target(
            name: "PhonoCorrectKeyboard",
            dependencies: []
        ),
        .testTarget(
            name: "PhonoCorrectKeyboardTests",
            dependencies: ["PhonoCorrectKeyboard"]
        ),
    ]
)