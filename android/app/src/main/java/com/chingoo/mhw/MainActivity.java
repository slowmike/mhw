package com.chingoo.mhw;

import com.reactnativenavigation.controllers.SplashActivity;
import org.devio.rn.splashscreen.SplashScreen;
import android.os.Bundle;
public class MainActivity extends SplashActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        SplashScreen.show(this, false);
        super.onCreate(savedInstanceState);
    }
}