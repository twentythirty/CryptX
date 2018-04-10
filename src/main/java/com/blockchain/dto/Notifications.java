package com.blockchain.dto;

import java.util.Date;

import com.blockchain.utils.CustomDateAndTimeDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

public class Notifications {
	@JsonDeserialize(using = CustomDateAndTimeDeserialize.class)
	private Date notification_title_vars;

	private String notification_type_title;

	private String notification_pinned;

	private String notification_vars;

	private String notification_sound_id;

	private String notification_sound;

	private String notification_id;

	private String notification_style;

	private String notification_type_message;

	public Date getNotification_title_vars() {
		return notification_title_vars;
	}

	public void setNotification_title_vars(Date notification_title_vars) {
		this.notification_title_vars = notification_title_vars;
	}

	public String getNotification_type_title() {
		return notification_type_title;
	}

	public void setNotification_type_title(String notification_type_title) {
		this.notification_type_title = notification_type_title;
	}

	public String getNotification_pinned() {
		return notification_pinned;
	}

	public void setNotification_pinned(String notification_pinned) {
		this.notification_pinned = notification_pinned;
	}

	public String getNotification_vars() {
		return notification_vars;
	}

	public void setNotification_vars(String notification_vars) {
		this.notification_vars = notification_vars;
	}

	public String getNotification_sound_id() {
		return notification_sound_id;
	}

	public void setNotification_sound_id(String notification_sound_id) {
		this.notification_sound_id = notification_sound_id;
	}

	public String getNotification_sound() {
		return notification_sound;
	}

	public void setNotification_sound(String notification_sound) {
		this.notification_sound = notification_sound;
	}

	public String getNotification_id() {
		return notification_id;
	}

	public void setNotification_id(String notification_id) {
		this.notification_id = notification_id;
	}

	public String getNotification_style() {
		return notification_style;
	}

	public void setNotification_style(String notification_style) {
		this.notification_style = notification_style;
	}

	public String getNotification_type_message() {
		return notification_type_message;
	}

	public void setNotification_type_message(String notification_type_message) {
		this.notification_type_message = notification_type_message;
	}
}