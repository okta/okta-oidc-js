/*
 * Copyright (c) 2019, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

package com.oktareactnative;

import android.annotation.SuppressLint;
import android.net.Uri;
import android.os.Build;

import androidx.annotation.NonNull;
import androidx.annotation.VisibleForTesting;

import com.okta.oidc.BuildConfig;
import com.okta.oidc.net.ConnectionParameters;
import com.okta.oidc.net.OktaHttpClient;
import com.okta.oidc.net.request.TLSSocketFactory;

import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import java.util.List;
import java.util.Map;

import javax.net.ssl.HttpsURLConnection;

import static com.okta.oidc.net.ConnectionParameters.USER_AGENT;

public class HttpClientImpl implements OktaHttpClient {
    private HttpURLConnection mUrlConnection;
    private String userAgentTemplate;

    HttpClientImpl(String userAgentTemplate) {
        this.userAgentTemplate = userAgentTemplate;
    }

    /*
     * TLS v1.1, v1.2 in Android supports starting from API 16.
     * But it enabled by default starting from API 20.
     * This method enable these TLS versions on API < 20.
     * */
    @SuppressLint("RestrictedApi")
    private void enableTlsV1_2(HttpURLConnection urlConnection) {
        try {
            ((HttpsURLConnection) urlConnection)
                    .setSSLSocketFactory(new TLSSocketFactory());
        } catch (NoSuchAlgorithmException | KeyManagementException e) {
            throw new RuntimeException("Cannot create SSLContext.", e);
        }
    }

    private String getUserAgent() {
        String sdkVersion = "okta-oidc-android/" + BuildConfig.VERSION_NAME;
        return userAgentTemplate.replace("$UPSTREAM_SDK", sdkVersion);
    }

    protected HttpURLConnection openConnection(URL url, ConnectionParameters params)
            throws IOException {
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        if (mUrlConnection instanceof HttpsURLConnection &&
                Build.VERSION.SDK_INT <= Build.VERSION_CODES.LOLLIPOP) {
            enableTlsV1_2(mUrlConnection);
        }

        conn.setConnectTimeout(params.connectionTimeoutMs());
        conn.setReadTimeout(params.readTimeOutMs());
        conn.setInstanceFollowRedirects(false);

        Map<String, String> requestProperties = params.requestProperties();
        String userAgent = getUserAgent();
        requestProperties.put(USER_AGENT, userAgent);
        if (requestProperties != null) {
            for (String property : requestProperties.keySet()) {
                conn.setRequestProperty(property, requestProperties.get(property));
            }
        }

        ConnectionParameters.RequestMethod requestMethod = params.requestMethod();
        Map<String, String> postParameters = params.postParameters();
        conn.setRequestMethod(requestMethod.name());
        if (requestMethod == ConnectionParameters.RequestMethod.GET) {
            conn.setDoInput(true);
        } else if (requestMethod == ConnectionParameters.RequestMethod.POST) {
            conn.setDoOutput(true);
            if (postParameters != null && !postParameters.isEmpty()) {
                DataOutputStream out = new DataOutputStream(conn.getOutputStream());
                out.write(params.getEncodedPostParameters());
                out.close();
            }
        }
        return conn;
    }

    @Override
    public InputStream connect(@NonNull Uri uri, @NonNull ConnectionParameters params)
            throws Exception {

        mUrlConnection = openConnection(new URL(uri.toString()), params);
        mUrlConnection.connect();
        try {
            return mUrlConnection.getInputStream();
        } catch (IOException e) {
            return mUrlConnection.getErrorStream();
        }
    }


    @Override
    public void cleanUp() {
        mUrlConnection = null;
    }

    @Override
    public void cancel() {
        if (mUrlConnection != null) {
            mUrlConnection.disconnect();
        }
    }

    @Override
    public Map<String, List<String>> getHeaderFields() {
        if (mUrlConnection != null) {
            return mUrlConnection.getHeaderFields();
        }
        return null;
    }

    @Override
    public String getHeader(String header) {
        if (mUrlConnection != null) {
            return mUrlConnection.getHeaderField(header);
        }
        return null;
    }

    @Override
    public int getResponseCode() throws IOException {
        if (mUrlConnection != null) {
            return mUrlConnection.getResponseCode();
        }
        return -1;
    }

    @Override
    public int getContentLength() {
        if (mUrlConnection != null) {
            return mUrlConnection.getContentLength();
        }
        return -1;
    }

    @Override
    public String getResponseMessage() throws IOException {
        if (mUrlConnection != null) {
            return mUrlConnection.getResponseMessage();
        }
        return null;
    }

    public HttpURLConnection getUrlConnection() {
        return mUrlConnection;
    }
}