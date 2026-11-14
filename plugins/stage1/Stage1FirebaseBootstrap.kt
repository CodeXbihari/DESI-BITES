package com.desi.app.stage1

import android.app.Application
import com.google.firebase.FirebaseApp
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.FirebaseFirestoreSettings

// This file is generated into src/stage1 only. It is absent from debug/release.
object Stage1FirebaseBootstrap {
  @Volatile private var result: Map<String, Any> = mapOf("version" to 1, "ready" to false)
  fun snapshot(): Map<String, Any> = result.toMap()

  @JvmStatic @Synchronized fun initialize(application: Application) {
    check(!result.containsKey("applicationId")) { "Stage 1 bootstrap may run only once." }
    var authConnected = false
    var firestoreConnected = false
    try {
      check(application.packageName == "com.desi.app.stage1") { "Stage 1 application ID mismatch." }
      val app = FirebaseApp.getInstance()
      check(app.options.projectId == "demo-desiibites-stage1") { "Stage 1 Firebase project mismatch." }
      // Before loadReactNative and therefore before any RNFB Auth module/listeners.
      FirebaseAuth.getInstance(app).useEmulator("127.0.0.1", 9099)
      authConnected = true
      val db = FirebaseFirestore.getInstance(app)
      db.firestoreSettings = FirebaseFirestoreSettings.Builder().setPersistenceEnabled(false).build()
      db.useEmulator("127.0.0.1", 8080)
      firestoreConnected = true
      result = mapOf("version" to 1, "ready" to true,
        "applicationId" to application.packageName, "projectId" to app.options.projectId!!,
        "transport" to "usb", "host" to "127.0.0.1", "authPort" to 9099,
        "firestorePort" to 8080, "authConnected" to true, "firestoreConnected" to true)
    } catch (_: Exception) {
      // Render only the dedicated blocking UI. Never start a fallback app or
      // expose exception contents that could include SDK configuration values.
      result = mapOf("version" to 1, "ready" to false,
        "applicationId" to application.packageName, "authConnected" to authConnected,
        "firestoreConnected" to firestoreConnected, "error" to "Native Stage 1 initialization failed.")
    }
  }
}
