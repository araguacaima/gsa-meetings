function jiraQARules(q) {
    $.get("/jira/tickets", {q: q, full: $("#full")[0].checked})
        .done(function (data) {
            //let result = $("#result");
            //result.empty();
            //result.jsonView(JSON.stringify(data), {collapsed: true});
            let value = "";
            data.forEach(function (issue) {
                value = value + "\n" + issue.key;
                if (issue.fields.customfield_10351) {
                    issue.fields.customfield_10351.forEach(function (valueIndicator) {
                        if (valueIndicator.value === "NextGen BBVA") {
                            value = value + " es NextGen";
                            if (!issue.fields.customfield_11905) {
                                value = value + " pero no ha indicado cuáles componentes NextGen utiliza."
                            } else {
                                value = value + "\n" + issue.key + " tiene todos sus indicadores OK"
                            }
                        } else {
                            value = value + "\n" + issue.key + " tiene todos sus indicadores OK"
                        }
                    });
                }

            });
            $("#validation").html(value);
        });
}