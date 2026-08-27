export type ProjectStatus = 'idea'|'planning'|'development'|'testing'|'deployed'|'completed'|'paused'|'archived';
export type Project = {
  id:string; user_id:string; name:string; slug:string; short_description:string|null; full_description:string|null;
  cover_url:string|null; category:string|null; status:ProjectStatus; priority:'low'|'medium'|'high'; progress:number;
  github_url:string|null; live_url:string|null; docs_url:string|null; api_url:string|null; hosting_provider:string|null;
  visibility:'private'|'unlisted'|'public'; featured:boolean; start_date:string|null; target_date:string|null; created_at:string; updated_at:string;
};
export type Task={id:string;project_id:string;title:string;description:string|null;status:'todo'|'doing'|'done';priority:'low'|'medium'|'high';due_date:string|null;created_at:string};
export type Milestone={id:string;project_id:string;title:string;description:string|null;due_date:string|null;completed:boolean;created_at:string};
export type Update={id:string;project_id:string;title:string;body:string|null;version:string|null;created_at:string};
export type Technology={id:string;name:string;category:string|null};
