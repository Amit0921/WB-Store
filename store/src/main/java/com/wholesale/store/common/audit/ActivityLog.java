package com.wholesale.store.common.audit;

import com.wholesale.store.common.entity.BaseEntity;
import com.wholesale.store.users.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "activity_logs")
@Getter
@Setter
public class ActivityLog extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private String action;

    private String entityType;

    private String entityId;

    @Column(columnDefinition = "TEXT")
    private String metadata;
}