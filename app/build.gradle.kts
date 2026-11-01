plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "com.manceraarts.filmframe"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.manceraarts.filmframe"
        minSdk = 26
        targetSdk = 35
        versionCode = (project.findProperty("ff.versionCode") as String).toInt()
        versionName = project.findProperty("ff.versionName") as String
    }

    // Firma estable (necesaria para que cada APK nuevo se instale ENCIMA del anterior).
    // El workflow de GitHub decodifica el keystore desde secretos y exporta estas variables.
    val ksFile = System.getenv("KEYSTORE_FILE")
    signingConfigs {
        if (ksFile != null && file(ksFile).exists()) {
            create("release") {
                storeFile = file(ksFile)
                storePassword = System.getenv("KEYSTORE_PASSWORD")
                keyAlias = System.getenv("KEY_ALIAS")
                keyPassword = System.getenv("KEY_PASSWORD")
            }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            signingConfig = signingConfigs.findByName("release")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }

    // La web (index.html, css/, js/) vive en /web y se empaqueta tal cual como assets.
    sourceSets["main"].assets.srcDir("$rootDir/web")

    packaging {
        resources.excludes += "/META-INF/{AL2.0,LGPL2.1}"
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.webkit)
}
