import org.jetbrains.kotlin.gradle.targets.js.webpack.KotlinWebpackConfig

plugins {
    alias(libs.plugins.kotlinMultiplatform)
    alias(libs.plugins.androidApplication)
    alias(libs.plugins.composeMultiplatform)
    alias(libs.plugins.composeCompiler)
    alias(libs.plugins.kotlinSerialization)
}

kotlin {
    androidTarget {
        compilations.all {
            kotlinOptions { jvmTarget = "17" }
        }
    }

    // jsMain primero; wasmJs solo tras validar Socket + multipart en navegador
    js(IR) {
        browser {
            commonWebpackConfig {
                outputFileName = "amigojolive.js"
                cssSupport { enabled.set(true) }
            }
            runTask { mainOutputFileName = "amigojolive.js" }
        }
        binaries.executable()
    }

    sourceSets {
        commonMain.dependencies {
            implementation(compose.runtime)
            implementation(compose.foundation)
            implementation(compose.material3)
            implementation(compose.ui)
            implementation(compose.components.resources)
            implementation(compose.components.uiToolingPreview)
            implementation(compose.materialIconsExtended)

            // Red compartida
            implementation(libs.ktor.client.core)
            implementation(libs.ktor.client.content.negotiation)
            implementation(libs.ktor.serialization.json)
            implementation(libs.ktor.client.auth)
            implementation(libs.ktor.client.logging)

            implementation(libs.kotlinx.serialization.json)
            implementation(libs.kotlinx.coroutines.core)

            // Navegación KMP — Voyager (estándar de facto vs Navigation Compose tosco en web)
            implementation(libs.voyager.navigator)
            implementation(libs.voyager.screen.model)
            implementation(libs.voyager.tab.navigator)
            implementation(libs.voyager.transitions)
        }

        androidMain.dependencies {
            // Motor HTTP Android
            implementation(libs.ktor.client.okhttp)
            implementation(libs.kotlinx.coroutines.android)

            // Android UI / ciclo de vida
            implementation(libs.activity.compose)
            implementation(libs.datastore.preferences)
            implementation(libs.lifecycle.viewmodel.compose)

            // Socket.IO — cliente Java oficial para Android
            implementation(libs.socket.io.java)
            implementation(libs.security.crypto)
        }

        jsMain.dependencies {
            // Motor HTTP Kotlin/JS
            implementation(libs.ktor.client.js)

            // socket.io-client NPM — no se reimplementa el protocolo;
            // el compilador Kotlin/JS enlaza directamente la librería via @JsModule
            implementation(npm("socket.io-client", "4.7.5"))
        }

        commonTest.dependencies {
            implementation(kotlin("test"))
            implementation(libs.ktor.client.mock)
            implementation(libs.kotlinx.coroutines.test)
        }
    }
}

android {
    namespace = "com.amigojolive"
    compileSdk = libs.versions.android.compileSdk.get().toInt()

    defaultConfig {
        applicationId = "com.amigojolive"
        minSdk = libs.versions.android.minSdk.get().toInt()
        targetSdk = libs.versions.android.targetSdk.get().toInt()
        versionCode = 1
        versionName = "1.0.0"
    }

    packaging { resources.excludes += "/META-INF/{AL2.0,LGPL2.1}" }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"))
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}
