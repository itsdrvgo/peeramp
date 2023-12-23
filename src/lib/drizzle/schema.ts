import { DEFAULT_PROFILE_IMAGE_URL } from "@/src/config/const";
import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";
import {
    boolean,
    index,
    jsonb,
    pgTable,
    text,
    timestamp,
    uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import {
    AmpAttachment,
    AmpMetadata,
    Status,
    Visibility,
} from "../validation/amp";
import {
    Education,
    Resume,
    UserCategoryType,
    UserGenderType,
    UserSocial,
    UserType,
} from "../validation/user";

// SCHEMAS

export const users = pgTable(
    "users",
    {
        id: text("id").notNull().unique().primaryKey(),
        firstName: text("first_name").notNull(),
        lastName: text("last_name").notNull(),
        username: text("username").notNull().unique(),
        email: text("email").notNull().unique(),
        image: text("image").notNull().default(DEFAULT_PROFILE_IMAGE_URL),
        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => {
        return {
            emailIdx: uniqueIndex("email_idx").on(table.email),
            usernameIdx: uniqueIndex("username_idx").on(table.username),
        };
    }
);

export const userDetails = pgTable(
    "user_details",
    {
        userId: text("user_id")
            .notNull()
            .unique()
            .references(() => users.id, {
                onDelete: "cascade",
            })
            .primaryKey(),
        bio: text("bio"),
        type: text("type").notNull().default("normal").$type<UserType>(),
        category: text("category")
            .notNull()
            .default("none")
            .$type<UserCategoryType>(),
        gender: text("gender")
            .notNull()
            .default("none")
            .$type<UserGenderType>(),
        isVerified: boolean("is_verified").notNull().default(false),
        socials: jsonb("socials").notNull().$type<UserSocial[]>().default([]),
        education: jsonb("education")
            .notNull()
            .default([])
            .$type<Education[]>(),
        resume: jsonb("resume").default(null).$type<Resume>(),
        usernameChangedAt: timestamp("username_changed_at", {
            withTimezone: true,
        })
            .notNull()
            .defaultNow(),
    },
    (table) => {
        return {
            categoryIdx: index("category_idx").on(table.category),
            typeIdx: index("type_idx").on(table.type),
            genderIdx: index("gender_idx").on(table.gender),
        };
    }
);

export const amps = pgTable(
    "amps",
    {
        id: text("id").notNull().unique().primaryKey(),
        creatorId: text("creator_id")
            .notNull()
            .references(() => users.id, {
                onDelete: "cascade",
            }),
        content: text("content").notNull().default(""),
        status: text("status").notNull().default("draft").$type<Status>(),
        visibility: text("visibility")
            .notNull()
            .default("everyone")
            .$type<Visibility>(),
        pinned: boolean("pinned").notNull().default(false),
        metadata: jsonb("metadata").default(null).$type<AmpMetadata>(),
        attachments: jsonb("attachments")
            .default(null)
            .$type<AmpAttachment[]>(),
        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true }),
        publishedAt: timestamp("published_at", { withTimezone: true }),
    },
    (table) => {
        return {
            creatorIdx: index("creator_idx").on(table.creatorId),
            pinnedIdx: index("pinned_idx").on(table.pinned, table.creatorId),
        };
    }
);

// RELATIONS

export const userRelations = relations(users, ({ one, many }) => ({
    details: one(userDetails, {
        fields: [users.id],
        references: [userDetails.userId],
    }),
    amps: many(amps),
    following: many(users, {
        relationName: "following",
    }),
    peers: many(users, {
        relationName: "peers",
    }),
}));

// TYPES

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export type UserDetails = InferSelectModel<typeof userDetails>;
export type NewUserDetails = InferInsertModel<typeof userDetails>;

export type Amp = InferSelectModel<typeof amps>;
export type NewAmp = InferInsertModel<typeof amps>;

// ZOD SCHEMA

export const insertUserSchema = createInsertSchema(users);
export const insertUserDetailsSchema = createInsertSchema(userDetails);
export const insertAmpSchema = createInsertSchema(amps);
