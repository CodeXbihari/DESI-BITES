package com.desi.app.stage1

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.uimanager.ViewManager

class Stage1RuntimeModule(context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {
  override fun getName(): String = "DesiiStage1Runtime"
  override fun getConstants(): Map<String, Any> = Stage1FirebaseBootstrap.snapshot()
  // No setters, account creation, membership grants, or other JS-callable methods.
}

class Stage1RuntimePackage : ReactPackage {
  override fun createNativeModules(context: ReactApplicationContext): List<NativeModule> = listOf(Stage1RuntimeModule(context))
  override fun createViewManagers(context: ReactApplicationContext): List<ViewManager<*, *>> = emptyList()
}
