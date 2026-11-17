package com.wholesale.store.users.entity;

import com.wholesale.store.common.entity.BaseEntity;
import com.wholesale.store.users.enums.RoleType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "roles")
@Getter
@Setter
public class Role extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true)
    private RoleType name;
}
