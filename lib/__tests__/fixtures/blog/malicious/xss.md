---
title: "Article potentiellement malveillant"
slug: "xss"
description: "Contenu généré par IA sans revue ligne à ligne"
excerpt: "Extrait"
publishedAt: "2026-01-15"
coverImage: "/blog/xss/cover.jpg"
coverImageAlt: "Illustration"
tags: []
---

Un paragraphe normal.

<script>alert('xss')</script>

<iframe src="https://evil.example.com"></iframe>

<img src="x" onerror="alert(1)" />

<a href="javascript:alert(1)">lien piégé</a>
