package com.blockchain.utils;

import java.io.IOException;
import java.util.List;

import org.apache.http.Consts;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.util.EntityUtils;
import org.apache.log4j.Logger;




public class HTTPClient
{
  public HTTPClient() {}
  
  private static Logger logger = Logger.getLogger(HTTPClient.class);
  
  public String postHttp(String url, List<NameValuePair> params, List<NameValuePair> headers) throws IOException {
    logger.debug("postHttp method execution Start... ");
    HttpPost post = new HttpPost(url);
    post.setEntity(new UrlEncodedFormEntity(params, Consts.UTF_8));
    post.getEntity().toString();
    
    if (headers != null)
    {
      for (NameValuePair header : headers)
      {
        post.addHeader(header.getName(), header.getValue());
      }
    }
    
    HttpClient httpClient = HttpClientBuilder.create().build();
    HttpResponse response = httpClient.execute(post);
    
    HttpEntity entity = response.getEntity();
    if (entity != null)
    {
      return EntityUtils.toString(entity);
    }
    
    logger.debug("postHttp method execution completed... ");
    return null;
  }
}
