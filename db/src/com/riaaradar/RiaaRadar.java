package com.riaaradar;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.util.Map;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

/**
 * RIAA Radar specific methods
 */
public class RiaaRadar {

    /**
     * Return a mapping of RIAA affiliated labels
     * @return Map from MBID -> Source showing RIAA status
     */
    public Map<String, String> getRiaaLabels() {
        Gson gson = new Gson();
        TypeToken<Map<String, String>> tt = new TypeToken<Map<String, String>>() {};
        FileReader labelsFile = openLabelsFile();
        return gson.fromJson(labelsFile, tt.getType());
    }

    /**
     * Return a file of RIAA affiliated labels
     * @return FileReader of open labels file
     */
    private FileReader openLabelsFile() {
        try {
            return new FileReader(new File("lib/labels.js"));
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        }
        return null;
    }
}
