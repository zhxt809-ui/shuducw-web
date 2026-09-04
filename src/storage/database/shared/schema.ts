import { pgTable, serial, varchar, text, timestamp, integer, boolean, index } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const articles = pgTable(
	"articles",
	{
		id: serial().primaryKey(),
		title: varchar("title", { length: 500 }).notNull(),
		slug: varchar("slug", { length: 500 }).notNull().unique(),
		category: varchar("category", { length: 50 }).notNull(),
		summary: text("summary"),
		content: text("content").notNull(),
		cover_image: varchar("cover_image", { length: 1000 }),
		is_published: boolean("is_published").default(false).notNull(),
		sort_order: integer("sort_order").default(0).notNull(),
		published_at: timestamp("published_at", { withTimezone: true }),
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("articles_category_idx").on(table.category),
		index("articles_slug_idx").on(table.slug),
		index("articles_is_published_idx").on(table.is_published),
		index("articles_published_at_idx").on(table.published_at),
		index("articles_sort_order_idx").on(table.sort_order),
	]
);
