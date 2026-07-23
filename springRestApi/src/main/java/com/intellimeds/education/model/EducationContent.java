package com.intellimeds.education.model;

import com.intellimeds.model.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "education_contents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EducationContent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "content_type")
    @Enumerated(EnumType.STRING)
    private ContentType contentType;

    @Column(name = "file_url")
    private String fileUrl;

    @Column(name = "video_url")
    private String videoUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id")
    private User author;

    @Column(name = "category")
    private String category;

    @Column(name = "is_published")
    @Builder.Default
    private Boolean isPublished = true;

    @Column(name = "download_count")
    @Builder.Default
    private Integer downloadCount = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum ContentType {
        PDF,
        ARTICLE,
        VIDEO
    }
}
