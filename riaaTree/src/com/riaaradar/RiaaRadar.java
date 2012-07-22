package com.riaaradar;

import java.io.FileNotFoundException;
import java.io.FileReader;
import java.lang.reflect.Type;
import java.util.Map;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

// Core RIAA Radar specific methods
public final class RiaaRadar {
    
    // Location of the RIAA labels file
    private String riaaLabelsFile = "lib/labels.js";

    // Returns a mapping of RIAA affiliated labels
    // (MBID → URL of source showing RIAA status of label)
    public Map<String, String> getRiaaLabels() {
        Gson gson = new Gson();
        Type mapType = (new TypeToken<Map<String, String>>() {}).getType();
        return gson.fromJson(openLabelsFile(), mapType);
    }

    // Returns a FileReader of RIAA affiliated labels
    private FileReader openLabelsFile() {
        FileReader file = null;
        try {
            file = new FileReader(riaaLabelsFile);
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        }
        return file;
    }
    
}
