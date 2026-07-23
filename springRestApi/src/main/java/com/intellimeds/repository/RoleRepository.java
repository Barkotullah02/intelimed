package com.intellimeds.repository;

import com.intellimeds.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoleRepository extends JpaRepository<Role, UUID> {
    Optional<Role> findByName(Role.RoleName name);
    Boolean existsByName(Role.RoleName name);
}
