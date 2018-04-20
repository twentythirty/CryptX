package com.blockchain.dto;

import java.util.List;

public class AddOrderResponseDTO {
	private List<AddOrderDTO> data;
	private List<Notifications> notifications;
	public List<AddOrderDTO> getData() {
		return data;
	}
	public void setData(List<AddOrderDTO> data) {
		this.data = data;
	}
	public List<Notifications> getNotifications() {
		return notifications;
	}
	public void setNotifications(List<Notifications> notifications) {
		this.notifications = notifications;
	}
	
}	